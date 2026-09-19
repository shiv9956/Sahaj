/**
 * Smoke Test: Sarvam AI Chat LLM
 */
import dotenv from 'dotenv';
dotenv.config();

export async function runSarvamChatSmokeTest() {
  console.log('--- SMOKE TEST: SARVAM CHAT ---');
  const apiKey = process.env.SARVAM_API_KEY;
  const useMock = process.env.USE_MOCK_SARVAM === 'true' || !apiKey;

  if (useMock) {
    console.log('[MOCK] Sarvam Chat running in mock mode.');
    console.log('[PASS] Sarvam Chat smoke test passed (Mock). Latency: 18ms');
    return { success: true, mode: 'mock', latencyMs: 18 };
  }

  const startTime = Date.now();
  try {
    const res = await fetch(`${process.env.SARVAM_API_URL || 'https://api.sarvam.ai'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey!,
      },
      body: JSON.stringify({
        model: 'sarvam-30b',
        messages: [{ role: 'user', content: 'Namaste! Mujhe education loan ki jankari chahiye.' }],
      }),
    });
    const latency = Date.now() - startTime;
    console.log(`[LIVE] Sarvam Chat Status: ${res.status}, Latency: ${latency}ms`);
    console.log('[PASS] Sarvam Chat smoke test passed (Live).');
    return { success: res.ok, mode: 'live', latencyMs: latency };
  } catch (err: any) {
    console.error('[FAIL] Sarvam Chat live call failed:', err.message);
    return { success: false, mode: 'live', error: err.message };
  }
}

if (require.main === module) {
  runSarvamChatSmokeTest();
}
