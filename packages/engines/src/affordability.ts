import { calculateEMI } from './emi';

export interface StressTestScenario {
  scenarioName: string;
  emiPaise: number;
  emiToIncomePct: number;
  verdict: 'comfortable' | 'stretch' | 'risky';
  notes: string;
}

export interface AffordabilityAssessment {
  baseEmiPaise: number;
  monthlyIncomePaise: number;
  existingEmiPaise: number;
  totalEmiPaise: number;
  emiToIncomePct: number;
  totalEmiToIncomePct: number;
  baseVerdict: 'comfortable' | 'stretch' | 'risky';
  stressScenarios: StressTestScenario[];
}

export function evaluateAffordability(
  principalPaise: number,
  annualRatePct: number,
  tenureMonths: number,
  monthlyIncomePaise: number,
  existingEmiPaise: number = 0,
  moratoriumMonths: number = 0
): AffordabilityAssessment {
  const baseCalc = calculateEMI(principalPaise, annualRatePct, tenureMonths, moratoriumMonths);
  const baseEmi = baseCalc.monthlyEmiPaise;
  const totalEmi = baseEmi + existingEmiPaise;

  const emiToIncomePct = monthlyIncomePaise > 0 ? Math.round((baseEmi / monthlyIncomePaise) * 100) : 0;
  const totalEmiToIncomePct = monthlyIncomePaise > 0 ? Math.round((totalEmi / monthlyIncomePaise) * 100) : 0;

  const getVerdict = (pct: number): 'comfortable' | 'stretch' | 'risky' => {
    if (pct <= 35) return 'comfortable';
    if (pct <= 50) return 'stretch';
    return 'risky';
  };

  const baseVerdict = getVerdict(totalEmiToIncomePct);

  // Stress Scenarios
  const stressScenarios: StressTestScenario[] = [];

  // Scenario 1: Income drops by 20%
  const reducedIncome = Math.round(monthlyIncomePaise * 0.8);
  const s1Pct = reducedIncome > 0 ? Math.round((totalEmi / reducedIncome) * 100) : 100;
  stressScenarios.push({
    scenarioName: 'Income drops by 20%',
    emiPaise: totalEmi,
    emiToIncomePct: s1Pct,
    verdict: getVerdict(s1Pct),
    notes: 'Simulates temporary household income reduction'
  });

  // Scenario 2: Interest rate increases by +2%
  const s2Calc = calculateEMI(principalPaise, annualRatePct + 2, tenureMonths, moratoriumMonths);
  const s2TotalEmi = s2Calc.monthlyEmiPaise + existingEmiPaise;
  const s2Pct = monthlyIncomePaise > 0 ? Math.round((s2TotalEmi / monthlyIncomePaise) * 100) : 0;
  stressScenarios.push({
    scenarioName: 'Interest rate +2.0%',
    emiPaise: s2TotalEmi,
    emiToIncomePct: s2Pct,
    verdict: getVerdict(s2Pct),
    notes: 'Floating interest rate increase'
  });

  // Scenario 3: One skipped month (Capitalize 1 month EMI)
  const s3Calc = calculateEMI(principalPaise + baseEmi, annualRatePct, tenureMonths, moratoriumMonths);
  const s3TotalEmi = s3Calc.monthlyEmiPaise + existingEmiPaise;
  const s3Pct = monthlyIncomePaise > 0 ? Math.round((s3TotalEmi / monthlyIncomePaise) * 100) : 0;
  stressScenarios.push({
    scenarioName: '1 Month Skipped (Capitalized)',
    emiPaise: s3TotalEmi,
    emiToIncomePct: s3Pct,
    verdict: getVerdict(s3Pct),
    notes: 'Emergency month delay'
  });

  return {
    baseEmiPaise: baseEmi,
    monthlyIncomePaise,
    existingEmiPaise,
    totalEmiPaise: totalEmi,
    emiToIncomePct,
    totalEmiToIncomePct,
    baseVerdict,
    stressScenarios
  };
}
