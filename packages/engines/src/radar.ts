export interface FinePrintClause {
  clause_id: string;
  tag: 'prepayment' | 'moratorium_interest' | 'floating_rate' | 'processing_fee' | 'collateral' | 'waiting_period' | 'exclusion' | 'sub_limit' | 'co_pay';
  title: string;
  text: string;
  severity: number; // 1 to 5 scale
}

export interface ScoredFinePrintClause extends FinePrintClause {
  relevanceScore: number;
  explanation: string;
}

export function scoreFinePrintRadar(
  clauses: FinePrintClause[],
  userPriorities: string[] = []
): ScoredFinePrintClause[] {
  return clauses.map(clause => {
    let multiplier = 1.0;

    if (userPriorities.includes('flexibility') && (clause.tag === 'prepayment' || clause.tag === 'moratorium_interest')) {
      multiplier += 0.5;
    }
    if (userPriorities.includes('low_total_cost') && (clause.tag === 'processing_fee' || clause.tag === 'floating_rate')) {
      multiplier += 0.5;
    }
    if (userPriorities.includes('protection') && (clause.tag === 'exclusion' || clause.tag === 'waiting_period' || clause.tag === 'co_pay')) {
      multiplier += 0.5;
    }

    const relevanceScore = Math.min(5, Math.round(clause.severity * multiplier * 10) / 10);
    
    let explanation = `Clause '${clause.title}' carries a severity rating of ${clause.severity}/5.`;
    if (multiplier > 1.0) {
      explanation += ` Highlighted based on your stated priority preference (${userPriorities.join(', ')}).`;
    }

    return {
      ...clause,
      relevanceScore,
      explanation
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}
