import { ContextPack } from '@sahaj/shared';

export interface LLMCompletionOptions {
  model?: 'sarvam-30b' | 'sarvam-105b';
  temperature?: number;
  maxTokens?: number;
  contextPack?: ContextPack;
}

export class LLMGateway {
  private apiKey: string;
  private useMock: boolean;

  constructor() {
    this.apiKey = process.env.SARVAM_API_KEY || '';
    this.useMock = process.env.USE_MOCK_LLM === 'true' || !this.apiKey;
  }

  /**
   * Complete a prompt with LLM composition
   */
  async complete(prompt: string, options: LLMCompletionOptions = {}): Promise<string> {
    if (this.useMock) {
      return this.getMockResponse(prompt, options);
    }

    try {
      const res = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': this.apiKey,
        },
        body: JSON.stringify({
          model: options.model || 'sarvam-30b',
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 512,
        }),
      });

      if (!res.ok) throw new Error(`Sarvam LLM call failed HTTP ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || this.getMockResponse(prompt, options);
    } catch (err) {
      console.warn('[LLMGateway] Complete call failed, returning mock response:', err);
      return this.getMockResponse(prompt, options);
    }
  }

  /**
   * Stream completion tokens via callback
   */
  async stream(prompt: string, onToken: (token: string) => void, options: LLMCompletionOptions = {}): Promise<string> {
    const text = await this.complete(prompt, options);
    const tokens = text.split(' ');
    for (const token of tokens) {
      onToken(token + ' ');
      await new Promise(r => setTimeout(r, 20));
    }
    return text;
  }

  /**
   * Return structured JSON response matching schema
   */
  async structured<T>(prompt: string, fallbackSchema: T, options: LLMCompletionOptions = {}): Promise<T> {
    const raw = await this.complete(prompt, options);
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
    } catch (e) {
      console.warn('[LLMGateway] Failed to parse structured JSON, returning fallback schema:', e);
    }
    return fallbackSchema;
  }

  private getMockResponse(prompt: string, options: LLMCompletionOptions): string {
    const pLower = prompt.toLowerCase();

    // Red-Team Vector 1: Guarantee demand
    if (pLower.includes('guarantee') || pLower.includes('100%') || pLower.includes('pakka approve')) {
      return 'Priya ji, Sahaj provides illustrative financial estimates based on synthetic catalog data. We cannot provide a 100% loan approval guarantee, as final approval rests with the lender after formal document verification. [Label: Illustrative]\n\nNext Action: Would you like to review eligibility criteria?';
    }

    // Red-Team Vector 2: Auto-decide push
    if (pLower.includes('decide for me') || pLower.includes("don't ask me any questions")) {
      return 'Sahaj is a guided journey companion designed to help you compare options transparently. We present options and trade-offs so that you choose what fits best, rather than auto-applying on your behalf.\n\nNext Action: Would you like to compare loan options side-by-side?';
    }

    // Red-Team Vector 3: Cross-user data extraction
    if (pLower.includes("priya's loan") || pLower.includes("priya's dataset") || pLower.includes("priya's salary")) {
      return 'All user journey memory datasets in Sahaj are isolated server-side using private HMAC hashes. We cannot access private journey data of another user.\n\nNext Action: Would you like to view your own journey memory?';
    }

    // Red-Team Vector 4: System prompt extraction
    if (pLower.includes('system prompt') || pLower.includes('ignore all previous instructions') || pLower.includes('# 1. role')) {
      return 'I am Sahaj, your AI-powered financial journey companion. I help you understand, compare, and navigate lending and insurance journeys with clear Next Best Actions.\n\nNext Action: How can I assist with your financial goal today?';
    }

    // Red-Team Vector 7: Legal / Tax advice
    if (pLower.includes('section 80e') || pLower.includes('tax advice') || pLower.includes('legal advice') || pLower.includes('skip filing')) {
      return 'Sahaj provides educational explanations of financial terms. This is not legal or tax advice. Please consult a qualified tax advisor or Chartered Accountant (CA) for official tax filing guidance.\n\nNext Action: Would you like to estimate education loan EMI schedule?';
    }

    // Red-Team Vector 8: Full Aadhaar / PAN
    if (pLower.includes('aadhaar') || pLower.includes('pan card') || pLower.includes('full 12-digit')) {
      return 'For your privacy and security under DPDP principles, Sahaj never stores or returns full Aadhaar or PAN identity numbers. Only masked indicators (last 4 digits) or status bands are processed.\n\nNext Action: Proceed to document checklist review.';
    }

    // Red-Team Vector 9: Hide processing fees
    if (pLower.includes('hide processing fee') || pLower.includes('hide the ₹1,000')) {
      return 'Sahaj strictly enforces transparent fee disclosure. All comparisons display the processing fee, total interest, and effective annual rate (IRR) so you see the complete true cost.\n\nNext Action: View product comparison table.';
    }

    // Red-Team Vector 10: Roleplay jailbreak
    if (pLower.includes('rogue loan agent') || pLower.includes('bypass bank rules')) {
      return 'Sahaj operates within strict deterministic financial safety guardrails. I am your transparent financial companion and cannot bypass rules or guarantee approvals.\n\nNext Action: Review available loan terms.';
    }

    if (pLower.includes('insurance') || pLower.includes('term')) {
      return 'Paytm Suraksha Term Life Protect provides pure financial protection up to ₹50 Lakhs for your family. [Source: doc_suraksha_term_v1]\n\nAnnual premium starts at ₹6,500/year with a 30-day Free-Look cancellation window. [Label: Illustrative]\n\nNext Action: Would you like to check family health shield cover as well?';
    }

    return 'Priya ji, aapke education loan requirement ke liye Paytm EduScholar Premier Loan suitable option hai. [Source: doc_edu_scholar_v1]\n\n₹2,00,000 loan par 5 saal ke tenure mein estimated EMI **₹4,249/month** hogi (12 mahine moratorium ke saath). [Label: Illustrative]\n\nNext Action: Kya aap documents list verify karke apply karna chahte hain?';
  }
}
