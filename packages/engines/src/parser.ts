export interface ParsedAmountResult {
  paise: number;
  raw: string;
  confidence: number;
}

export interface ParsedDurationResult {
  months: number;
  raw: string;
  confidence: number;
}

const HINDI_NUMBER_WORDS: Record<string, number> = {
  'ek': 1, 'एक': 1,
  'do': 2, 'दो': 2,
  'teen': 3, 'तीन': 3,
  'chaar': 4, 'char': 4, 'चार': 4,
  'paanch': 5, 'panch': 5, 'पांच': 5,
  'chhe': 6, 'छह': 6,
  'saat': 7, 'सात': 7,
  'aath': 8, 'आठ': 8,
  'nau': 9, 'नौ': 9,
  'das': 10, 'दस': 10,
};

export function parseHinglishAmount(text: string): ParsedAmountResult | null {
  const normalized = text.toLowerCase().trim();

  // Pattern 1: Special Hinglish words
  if (/dedh\s+lakh|डेढ़\s+लाख/i.test(normalized)) {
    return { paise: 15000000, raw: text, confidence: 0.98 };
  }
  if (/dhai\s+lakh|dhāī\s+lakh|ढाई\s+लाख/i.test(normalized)) {
    return { paise: 25000000, raw: text, confidence: 0.98 };
  }
  if (/sava\s+lakh|सवा\s+लाख/i.test(normalized)) {
    return { paise: 12500000, raw: text, confidence: 0.98 };
  }
  if (/pachas\s+hazaar|पचास\s+हजार|50\s*k/i.test(normalized)) {
    return { paise: 5000000, raw: text, confidence: 0.95 };
  }

  // Pattern 2: Word-based Lakhs e.g. "do lakh", "दो लाख"
  for (const [word, num] of Object.entries(HINDI_NUMBER_WORDS)) {
    const wordLakhRegex = new RegExp(`(?:^|\\s)${word}\\s*(?:lakh|lac|l|लाख)(?:\\s|$)`, 'i');
    if (wordLakhRegex.test(normalized)) {
      return { paise: Math.round(num * 100000 * 100), raw: text, confidence: 0.96 };
    }
  }

  // Pattern 3: Numeric Lakhs e.g., "2 lakh", "2.5 lakh", "2L", "2 lac", "2.5L"
  const lakhMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l|लाख)/i);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    return { paise: Math.round(val * 100000 * 100), raw: text, confidence: 0.95 };
  }

  // Pattern 4: Numeric Crore e.g., "1 crore", "1 cr", "करोड़"
  const crMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr|करोड़)/i);
  if (crMatch) {
    const val = parseFloat(crMatch[1]);
    return { paise: Math.round(val * 10000000 * 100), raw: text, confidence: 0.95 };
  }

  // Pattern 5: Thousands e.g., "20k", "20 thousand", "20 hazaar"
  const kMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand|hazaar|हजार)/i);
  if (kMatch) {
    const val = parseFloat(kMatch[1]);
    return { paise: Math.round(val * 1000 * 100), raw: text, confidence: 0.90 };
  }

  // Pattern 6: Direct INR currency symbols or raw numbers e.g. "₹2,00,000", "200000"
  const rawNumMatch = normalized.replace(/[^0-9.]/g, '');
  if (rawNumMatch.length >= 4) {
    const val = parseFloat(rawNumMatch);
    if (!isNaN(val) && val > 0) {
      return { paise: Math.round(val * 100), raw: text, confidence: 0.85 };
    }
  }

  return null;
}

export function parseHinglishDuration(text: string): ParsedDurationResult | null {
  const normalized = text.toLowerCase().trim();

  // Word-based years e.g., "paanch saal", "पांच साल"
  for (const [word, num] of Object.entries(HINDI_NUMBER_WORDS)) {
    const wordYearRegex = new RegExp(`(?:^|\\s)${word}\\s*(?:saal|year|years|yr|साल)(?:\\s|$)`, 'i');
    if (wordYearRegex.test(normalized)) {
      return { months: num * 12, raw: text, confidence: 0.95 };
    }
  }

  // Years match e.g., "5 saal", "5 years", "5 yr", "5 साल"
  const yearMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:saal|year|years|yr|साल)/i);
  if (yearMatch) {
    const yrs = parseFloat(yearMatch[1]);
    return { months: Math.round(yrs * 12), raw: text, confidence: 0.95 };
  }

  // Months match e.g., "60 mahine", "60 months", "60 m", "60 महीने"
  const monthMatch = normalized.match(/(\d+)\s*(?:mahine|month|months|m|महीने)/i);
  if (monthMatch) {
    const m = parseInt(monthMatch[1], 10);
    return { months: m, raw: text, confidence: 0.95 };
  }

  return null;
}
