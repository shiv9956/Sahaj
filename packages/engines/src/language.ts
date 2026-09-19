export type LanguageCode = 'en' | 'hi' | 'hinglish' | 'mixed';

export interface LanguageDetectionResult {
  language: LanguageCode;
  script: 'Latn' | 'Deva';
  confidence: number;
}

export function detectLanguageAndScript(text: string): LanguageDetectionResult {
  const containsDevanagari = /[\u0900-\u097F]/.test(text);

  if (containsDevanagari) {
    return {
      language: 'hi',
      script: 'Deva',
      confidence: 0.98
    };
  }

  const hinglishKeywords = ['mujhe', 'chahiye', 'zarurat', 'hai', 'kitna', 'kaise', 'kya', 'samjhao', 'kist', 'padhai'];
  const lower = text.toLowerCase();
  const wordCount = lower.split(/\s+/).length;
  const matchCount = hinglishKeywords.filter(kw => lower.includes(kw)).length;

  if (matchCount >= 1) {
    return {
      language: 'hinglish',
      script: 'Latn',
      confidence: Math.min(0.95, 0.7 + (matchCount * 0.1))
    };
  }

  return {
    language: 'en',
    script: 'Latn',
    confidence: 0.85
  };
}

export function transliterateDevanagariToRoman(text: string): string {
  // Simple indicative dictionary for UI transliteration toggle
  const map: Record<string, string> = {
    'डेढ़': 'dedh',
    'ढाई': 'dhai',
    'सवा': 'sava',
    'लाख': 'lakh',
    'हजार': 'hazaar',
    'रुपये': 'rupees',
    'किस्त': 'kist',
    'ब्याज': 'byaj'
  };

  let out = text;
  for (const [deva, rom] of Object.entries(map)) {
    out = out.replace(new RegExp(deva, 'g'), rom);
  }
  return out;
}
