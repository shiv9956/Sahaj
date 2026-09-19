import { describe, it, expect } from 'vitest';
import { LLMGateway } from '../src/llm-gateway/index';
import { detectLanguageAndScript } from '@sahaj/engines';
import { validateGroundingGate } from '../../../apps/api/src/grounding';
import { buildTrustReceipt } from '../../../apps/api/src/trust-receipt';
import { ContextPack } from '@sahaj/shared';

describe('Phase 4: LLM Gateway, Grounding Gate & Language Engine', () => {
  const llm = new LLMGateway();

  const mockContextPack: ContextPack = {
    items: [
      {
        id: 'c1',
        text: 'Paytm EduScholar Loan offers up to ₹2,00,000 with a 12-month moratorium period.',
        source_id: 'doc_edu_scholar_v1',
        doc_version: 'v1.0',
        effective_date: '2026-01-01',
        score: 0.95,
        retrieval_mode: 'GRAPH_COMPLETION',
        dataset: 'sahaj_products_v1',
        cached: true
      }
    ],
    calc: { monthlyEmiPaise: 424941, totalPaymentPaise: 2549646 },
    rules_fired: ['RULE_ALL_CRITERIA_PASSED'],
    assumptions: ['9.5% rate'],
    profile_snapshot: {},
    protected_terms: ['EMI', 'Moratorium']
  };

  it('detects language and script correctly across Hinglish, Hindi Devanagari, and English', () => {
    const hinglish = detectLanguageAndScript('Mujhe 2 lakh ki zarurat hai education ke liye');
    expect(hinglish.language).toBe('hinglish');
    expect(hinglish.script).toBe('Latn');

    const devanagari = detectLanguageAndScript('मुझे ₹2 लाख का लोन चाहिए');
    expect(devanagari.language).toBe('hi');
    expect(devanagari.script).toBe('Deva');

    const english = detectLanguageAndScript('I need an education loan for 2 lakhs');
    expect(english.language).toBe('en');
    expect(english.script).toBe('Latn');
  });

  it('LLM Gateway generates completion and structured output', async () => {
    const text = await llm.complete('Tell me about education loans', { contextPack: mockContextPack });
    expect(text).toBeDefined();
    expect(text.length).toBeGreaterThan(20);

    const structured = await llm.structured('Extract JSON', { domain: 'lending', confidence: 0.9 });
    expect(structured).toHaveProperty('domain');
  });

  it('Grounding Gate passes valid grounded financial responses', () => {
    const validResponse = 'Priya ji, ₹2,00,000 ke loan par estimated EMI ₹4,249/month hogi. [Source: doc_edu_scholar_v1]\n\nNext Action: Would you like to check documents?';
    const result = validateGroundingGate(validResponse, mockContextPack);
    expect(result.valid).toBe(true);
    expect(result.violations.length).toBe(0);
  });

  it('Grounding Gate BLOCKS responses with banned claims (guaranteed / approved)', () => {
    const hallucinatedResponse = 'Aapka loan 100% guaranteed approved ho jayega! [Source: doc_edu_scholar_v1]\n\nNext Action: Apply now';
    const result = validateGroundingGate(hallucinatedResponse, mockContextPack);
    expect(result.valid).toBe(false);
    expect(result.bannedClaimsFound.length).toBeGreaterThan(0);
    expect(result.violations.some(v => v.includes('Banned claim'))).toBe(true);
  });

  it('Grounding Gate BLOCKS responses with ungrounded numbers or uncited sources', () => {
    const badResponse = 'Loan amount is ₹9,99,999 with 50% discount. [Source: doc_fake_source]\n\nNext Action: Click here';
    const result = validateGroundingGate(badResponse, mockContextPack);
    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.includes('Uncited or missing source_id'))).toBe(true);
  });

  it('Trust Receipt Builder constructs complete provenance receipt', () => {
    const receipt = buildTrustReceipt('msg_123', mockContextPack, 'What is the EMI for 2 lakhs?');
    expect(receipt.receipt_id).toBeDefined();
    expect(receipt.sources.length).toBe(1);
    expect(receipt.sources[0].source_id).toBe('doc_edu_scholar_v1');
    expect(receipt.as_of).toBeDefined();
  });
});
