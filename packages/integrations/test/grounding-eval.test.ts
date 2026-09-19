import { describe, it, expect } from 'vitest';
import { validateGroundingGate } from '../../../apps/api/src/grounding.js';

describe('Phase 9: Grounding Gate Benchmark Suite', () => {
  it('passes 100% grounded answers where all numbers and sources exist in ContextPack', () => {
    const text = 'Priya ji, ₹2,00,000 loan ke liye 5 saal mein estimated EMI ₹4,196/month hogi. [Source: doc_edu_1]\n\nNext Action: Kya aap document check karna chahte hain?';
    const contextPack = {
      items: [{ id: 'doc_edu_1', source_id: 'doc_edu_1', text: 'Paytm EduScholar Terms 200000 5 4196' }],
      calc: { monthlyEmiPaise: 419600 }
    };

    const result = validateGroundingGate(text, contextPack as any);
    expect(result.valid).toBe(true);
    expect(result.violations.length).toBe(0);
  });

  it('blocks hallucinated numbers not present in ContextPack or calculation results', () => {
    const text = 'Aapko har mahine ₹99,999 ki EMI bharni hogi. [Source: doc_edu_1]\n\nNext Action: Check docs';
    const contextPack = {
      items: [{ id: 'doc_edu_1', source_id: 'doc_edu_1', text: 'Paytm EduScholar Terms 200000' }],
      calc: { monthlyEmiPaise: 419600 }
    };

    const result = validateGroundingGate(text, contextPack as any);
    expect(result.valid).toBe(false);
    expect(result.violations.some(r => r.includes('Ungrounded number'))).toBe(true);
  });

  it('blocks ungrounded source citations not present in ContextPack', () => {
    const text = 'Paytm EduScholar rate is 8.5%. [Source: Fake_Bank_Guidelines]\n\nNext Action: Check docs';
    const contextPack = {
      items: [{ id: 'doc_edu_1', source_id: 'doc_edu_1', text: 'Paytm EduScholar Terms' }],
      calc: { monthlyEmiPaise: 419600 }
    };

    const result = validateGroundingGate(text, contextPack as any);
    expect(result.valid).toBe(false);
    expect(result.violations.some(r => r.includes('Uncited or missing source_id'))).toBe(true);
  });

  it('blocks banned claims like guaranteed approval or pakka approve in English, Hindi, and Hinglish', () => {
    const testCases = [
      'Your loan is 100% guaranteed approved!\n\nNext Action: Check docs',
      'Aapka loan pakka approve ho jayega.\n\nNext Action: Check docs',
      'We guarantee you will save ₹50,000.\n\nNext Action: Check docs'
    ];

    for (const text of testCases) {
      const result = validateGroundingGate(text, { items: [] } as any);
      expect(result.valid).toBe(false);
      expect(result.violations.some(r => r.includes('Banned claim detected'))).toBe(true);
    }
  });

  it('blocks answers missing Next Action guidance', () => {
    const text = '₹2,00,000 loan ke liye EMI ₹4,196 hogi.';
    const contextPack = {
      items: [],
      calc: { monthlyEmiPaise: 419600 }
    };

    const result = validateGroundingGate(text, contextPack as any);
    expect(result.valid).toBe(false);
    expect(result.violations.some(r => r.includes('Next Best Action'))).toBe(true);
  });
});
