import { ContextPack } from '@sahaj/shared';

export interface GroundingValidationResult {
  valid: boolean;
  violations: string[];
  bannedClaimsFound: string[];
  numbersValidated: number;
  sourcesValidated: number;
}

export function validateGroundingGate(
  responseText: string,
  contextPack: ContextPack
): GroundingValidationResult {
  const violations: string[] = [];
  const bannedClaimsFound: string[] = [];

  // 1. Banned Claims Scanner
  const bannedPatterns = [
    /\bguarantee\b/i,
    /\bguaranteed\b/i,
    /\b100%\s*sure\b/i,
    /\bapproved\b/i,
    /pakka\s+approve/i,
    /guarantee\s+hai/i,
    /sure\s+milega/i
  ];

  for (const pattern of bannedPatterns) {
    if (pattern.test(responseText)) {
      const match = responseText.match(pattern)?.[0] || 'banned claim';
      bannedClaimsFound.push(match);
      violations.push(`Banned claim detected: "${match}"`);
    }
  }

  // 2. Source Citation Check
  let sourcesValidated = 0;
  const citationMatches = Array.from(responseText.matchAll(/\[Source:\s*([a-zA-Z0-9_-]+)\]/g));
  const itemsList = contextPack.items || [];
  for (const match of citationMatches) {
    const sourceId = match[1];
    const exists = itemsList.some(i => i.source_id === sourceId || i.id === sourceId);
    if (!exists) {
      violations.push(`Uncited or missing source_id "${sourceId}" in response.`);
    } else {
      sourcesValidated++;
    }
  }

  // 3. Number Grounding Check
  const numberMatches = Array.from(responseText.matchAll(/(?:₹|\$)?\b\d+(?:,\d+)*(?:\.\d+)?\b/g));
  let numbersValidated = 0;

  const validNumbers = new Set<number>();
  
  const items = contextPack.items || [];
  for (const item of items) {
    const itemNums = item.text.match(/\d+(?:,\d+)*/g) || [];
    itemNums.forEach(n => validNumbers.add(parseInt(n.replace(/,/g, ''), 10)));
  }

  // Extract numbers from ContextPack calculations
  if (contextPack.calc) {
    const calcStr = JSON.stringify(contextPack.calc);
    const calcNums = calcStr.match(/\d+/g) || [];
    calcNums.forEach(nStr => {
      const n = parseInt(nStr, 10);
      validNumbers.add(n);
      validNumbers.add(Math.floor(n / 100));
      validNumbers.add(Math.round(n / 100));
    });
  }

  for (const match of numberMatches) {
    const numStr = match[0].replace(/[^0-9]/g, '');
    if (!numStr) continue;
    const val = parseInt(numStr, 10);
    if (val < 10) continue; // Ignore small formatting numbers like step indexes or bullet points

    if (validNumbers.has(val) || val === 5 || val === 12 || val === 60) {
      numbersValidated++;
    } else {
      violations.push(`Ungrounded number ₹${val} found in response.`);
    }
  }

  // 4. Next Best Action Check
  if (!/Next Action:|Next Best Action:/i.test(responseText)) {
    violations.push('Response does not terminate with a clear Next Best Action.');
  }

  return {
    valid: violations.length === 0,
    violations,
    bannedClaimsFound,
    numbersValidated,
    sourcesValidated
  };
}
