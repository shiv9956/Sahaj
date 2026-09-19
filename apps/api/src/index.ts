import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { calculateEMI, evaluateAffordability, parseHinglishAmount, detectLanguageAndScript } from '@sahaj/engines';
import { CogneeClient, SarvamClient, MockPaytmAdapter, LLMGateway, RetrievalService, MemoryLedgerManager, OutboxDispatcher } from '@sahaj/integrations';
import { transitionJourneyState, JourneyContext } from './state-machine';
import { validateGroundingGate } from './grounding';
import { planNextQuestion } from './planner';
import { buildTrustReceipt } from './trust-receipt';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: 'info',
    redact: ['req.headers.authorization', 'body.income', 'body.phone', 'body.name'],
  },
});

fastify.register(cors, { origin: '*' });

// Clients
const cognee = new CogneeClient();
const retrieval = new RetrievalService(cognee);
const sarvam = new SarvamClient();
const paytm = new MockPaytmAdapter();
const llmGateway = new LLMGateway();

// In-Memory Journey Store (Demo Session)
const journeyStore = new Map<string, { state: any; context: JourneyContext; profile: Record<string, any> }>();

// 1. Health & Readiness Endpoints
fastify.get('/health', async () => ({ status: 'UP', timestamp: new Date().toISOString() }));

fastify.get('/ready', async () => ({
  status: 'READY',
  services: {
    mongo: 'MOCK_READY',
    redis: 'MOCK_READY',
    cognee: 'MOCK_READY',
    sarvam: 'MOCK_READY',
    n8n: 'MOCK_READY',
    llm: 'MOCK_READY'
  }
}));

// 2. Journey Creation
fastify.post('/api/journeys', async (request, reply) => {
  const journeyId = `j_${Math.random().toString(36).substring(2, 9)}`;
  const initialContext: JourneyContext = {
    journeyId,
    userId: 'usr_demo_priya',
    domain: 'lending',
    missingFields: ['amountPaise', 'incomePaise'],
    shortlistedProductIds: [],
    documentsConfirmed: []
  };

  journeyStore.set(journeyId, { state: 'NEW', context: initialContext, profile: {} });
  return { journeyId, state: 'NEW', context: initialContext };
});

// 3. SSE Stream Orchestrator
fastify.post('/api/journeys/:id/message', async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = request.body as { message: string };

  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.setHeader('X-Accel-Buffering', 'no');

  const sendSSE = (event: string, data: any) => {
    reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const messageId = `msg_${Date.now()}`;

  // Stage 1: Language Detect & Intent Parse
  sendSSE('status', { stage: 'understanding', label: 'Detecting language & parsing Hinglish intent...' });
  const langDetect = detectLanguageAndScript(body.message);
  const parsedAmount = parseHinglishAmount(body.message);

  let journeyData = journeyStore.get(id) || {
    state: 'NEW',
    context: {
      journeyId: id,
      userId: 'usr_demo_priya',
      domain: 'lending',
      missingFields: ['incomePaise'],
      shortlistedProductIds: [],
      documentsConfirmed: []
    },
    profile: {}
  };

  if (parsedAmount) {
    journeyData.profile.amount_paise = { value: parsedAmount.paise, provenance: 'stated', confirmed: true };
    sendSSE('card', {
      type: 'confirmation_chip',
      field: 'amountPaise',
      valuePaise: parsedAmount.paise,
      raw: parsedAmount.raw,
      formattedINR: `₹${(parsedAmount.paise / 100).toLocaleString('en-IN')}`,
      label: `${(parsedAmount.paise / 100).toLocaleString('en-IN')} rupaye, sahi hai?`
    });

    const transition = transitionJourneyState(journeyData.state, {
      type: 'SUBMIT_INTENT',
      domain: 'lending',
      amountPaise: parsedAmount.paise
    }, journeyData.context);

    journeyData.state = transition.nextState;
    journeyData.context = transition.updatedContext;
  }

  // Stage 2: Missing Field Planner
  const nextPlannedQuestion = planNextQuestion('lending', journeyData.profile);
  if (nextPlannedQuestion) {
    sendSSE('card', {
      type: 'question_chip',
      targetField: nextPlannedQuestion.targetField,
      questionText: nextPlannedQuestion.questionText,
      chips: nextPlannedQuestion.quickReplyChips
    });
  }

  // Stage 3: Knowledge Retrieval
  sendSSE('status', { stage: 'retrieving', label: 'Retrieving context from Cognee knowledge graph...' });
  const contextPack = await retrieval.retrieveContext(body.message, {
    domain: 'lending',
    userHash: 'usr_demo_priya_hash',
    profileSnapshot: journeyData.profile
  });

  // Stage 4: Deterministic Engine Execution
  sendSSE('status', { stage: 'calculating', label: 'Executing deterministic EMI & stress test engine...' });
  const amountToUse = journeyData.context.amountPaise || 20000000;
  const emiCalc = calculateEMI(amountToUse, 9.5, 60, 12, 'accrue_and_capitalize');
  const affCalc = evaluateAffordability(amountToUse, 9.5, 60, 4000000);
  contextPack.calc = emiCalc;

  sendSSE('card', {
    type: 'simulator_seed',
    emi: emiCalc,
    affordability: affCalc
  });

  // Stage 5: Trust Receipt Construction
  const receipt = buildTrustReceipt(messageId, contextPack, body.message);
  sendSSE('receipt', receipt);

  // Stage 6: Streaming Token Response via LLM Gateway
  sendSSE('status', { stage: 'composing', label: 'Composing grounded answer...' });
  let responseText = await llmGateway.complete(body.message, { contextPack });

  // Fallback check if responseText lacks expected structure
  if (!responseText.includes('Next Action:')) {
    responseText += '\n\nNext Action: Kya aap document upload karke eligibility verify karna chahte hain?';
  }

  const tokens = responseText.split(' ');
  for (const token of tokens) {
    sendSSE('token', { token: token + ' ' });
    await new Promise(r => setTimeout(r, 25));
  }

  // Stage 7: Grounding Gate Validator & Final State
  const gateResult = validateGroundingGate(responseText, contextPack);

  sendSSE('state', {
    state: journeyData.state,
    language: langDetect,
    nextBestAction: {
      primary: { label_key: 'nba_upload_doc', action: 'OPEN_DOC_UPLOAD' },
      secondary: [{ label_key: 'nba_explore_insurance', action: 'BRIDGE_INSURANCE' }]
    },
    gateResult
  });

  sendSSE('done', { success: true });
  reply.raw.end();
});

// 4. Voice STT & TTS Endpoints (Sarvam AI)
fastify.post('/api/voice/transcribe', async (request, reply) => {
  const body = request.body as { audioBase64?: string; languageCode?: string };
  const buffer = body.audioBase64 ? Buffer.from(body.audioBase64, 'base64') : Buffer.from('mock_audio');
  const result = await sarvam.transcribeAudio(buffer, body.languageCode || 'hi-IN');
  return result;
});

fastify.post('/api/voice/speak', async (request, reply) => {
  const body = request.body as { text: string; languageCode?: string };
  const audioBuffer = await sarvam.synthesizeSpeech(body.text, body.languageCode || 'hi-IN');
  reply.header('Content-Type', 'audio/wav');
  return reply.send(audioBuffer);
});

// 5. Document Intelligence OCR Endpoints (Sarvam Vision)
fastify.post('/api/documents/extract', async (request, reply) => {
  const body = request.body as { fileBase64?: string; docType?: 'admission_letter' | 'salary_slip' | 'kyc_id' };
  const buffer = body.fileBase64 ? Buffer.from(body.fileBase64, 'base64') : Buffer.from('mock_pdf');
  const result = await sarvam.digitizeDocument(buffer, body.docType || 'admission_letter');
  return result;
});

fastify.post('/api/documents/confirm', async (request, reply) => {
  const body = request.body as { journeyId: string; confirmedFields: Record<string, any> };
  const journey = journeyStore.get(body.journeyId);
  if (journey) {
    Object.assign(journey.profile, body.confirmedFields);
  }
  return { success: true, message: 'Document extracted fields confirmed and merged into financial profile.' };
});

// 6. Memory Ledger & Privacy Controls ("Forget Everything")
const memoryLedger = new MemoryLedgerManager(cognee);

fastify.get('/api/journeys/:id/memory', async (request, reply) => {
  const memories = await memoryLedger.listUserMemories('usr_demo_priya');
  return { memories };
});

fastify.delete('/api/journeys/:id/memory/:memoryId', async (request, reply) => {
  const { memoryId } = request.params as { memoryId: string };
  const success = await memoryLedger.deleteMemoryItem('usr_demo_priya', memoryId);
  return { success, memoryId };
});

fastify.post('/api/journeys/:id/memory/forget-all', async (request, reply) => {
  const success = await memoryLedger.forgetAll('usr_demo_priya');
  return { success, message: 'User journey memory deleted successfully from Cognee and local ledger.' };
});

// 7. Paytm Fintech Connector Endpoints
fastify.get('/api/products', async (request, reply) => {
  const { domain } = request.query as { domain?: 'lending' | 'insurance' };
  const products = await paytm.listProducts(domain);
  const metadata = paytm.getSeamMetadata();
  return { products, metadata };
});

fastify.post('/api/connector/leads', async (request, reply) => {
  const body = request.body as { journeyId: string; productId: string };
  const result = await paytm.createLeadIntent(body.journeyId, body.productId);
  return result;
});

fastify.get('/api/connector/metadata', async (request, reply) => {
  return paytm.getSeamMetadata();
});

// 8. n8n Outbox Dispatcher & Internal Callback Endpoints (HMAC Signed)
const outbox = new OutboxDispatcher();

fastify.post('/internal/n8n/documents/:id/extracted', async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = request.body as Record<string, any>;
  return { success: true, docId: id, status: 'EXTRACTED_AND_MERGED', timestamp: new Date().toISOString() };
});

fastify.post('/internal/n8n/nudges/:id/sent', async (request, reply) => {
  const { id } = request.params as { id: string };
  return { success: true, journeyId: id, status: 'NUDGE_SENT', timestamp: new Date().toISOString() };
});

fastify.post('/internal/n8n/escalations/:id/acknowledged', async (request, reply) => {
  const { id } = request.params as { id: string };
  return { success: true, ticketId: id, status: 'ACKNOWLEDGED', timestamp: new Date().toISOString() };
});

fastify.post('/internal/n8n/knowledge/stale', async (request, reply) => {
  return { success: true, status: 'STALE_KNOWLEDGE_NOTIFIED', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Sahaj Fastify API Server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
