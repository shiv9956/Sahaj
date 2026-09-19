import { EmiCalculationResult, calculateEMI } from './emi';
import { Money } from './money';

export interface ComparisonProductInput {
  product_id: string;
  title: string;
  provider_display: string;
  annualRatePct: number;
  processingFeePaise: number;
  maxTenureMonths: number;
  moratoriumMonths: number;
  collateralRequired: boolean;
  coapplicantRequired: boolean;
}

export interface ComparisonRow {
  product_id: string;
  title: string;
  provider_display: string;
  annualRatePct: number;
  processingFeeFormatted: string;
  monthlyEmiFormatted: string;
  totalPaymentFormatted: string;
  effectiveAnnualRatePct: number;
  moratoriumMonths: number;
  collateralRequired: boolean;
  coapplicantRequired: boolean;
  calculation: EmiCalculationResult;
  rankScore: number;
  highlights: string[];
}

export interface ComparisonResult {
  rows: ComparisonRow[];
  bestForLowEmi?: string;
  bestForLowTotalCost?: string;
  bestForFlexibility?: string;
  rankReason: string;
}

export function buildProductComparison(
  products: ComparisonProductInput[],
  requestedAmountPaise: number,
  tenureMonths: number,
  userPriorities: string[] = ['low_emi']
): ComparisonResult {
  const rows: ComparisonRow[] = products.map(prod => {
    const calc = calculateEMI(
      requestedAmountPaise,
      prod.annualRatePct,
      tenureMonths,
      prod.moratoriumMonths,
      'accrue_and_capitalize',
      prod.processingFeePaise
    );

    let rankScore = 100;
    const highlights: string[] = [];

    if (userPriorities.includes('low_emi')) {
      rankScore -= (calc.monthlyEmiPaise / 10000);
    }
    if (userPriorities.includes('low_total_cost')) {
      rankScore -= (calc.totalPaymentPaise / 100000);
    }
    if (userPriorities.includes('flexibility') && prod.moratoriumMonths > 0) {
      rankScore += 20;
      highlights.push(`Includes ${prod.moratoriumMonths} months moratorium period`);
    }

    if (!prod.collateralRequired) {
      highlights.push('Zero Collateral required');
    }

    return {
      product_id: prod.product_id,
      title: prod.title,
      provider_display: prod.provider_display,
      annualRatePct: prod.annualRatePct,
      processingFeeFormatted: new Money(prod.processingFeePaise).formatINR(),
      monthlyEmiFormatted: new Money(calc.monthlyEmiPaise).formatINR(),
      totalPaymentFormatted: new Money(calc.totalPaymentPaise).formatINR(),
      effectiveAnnualRatePct: calc.effectiveAnnualRatePct,
      moratoriumMonths: prod.moratoriumMonths,
      collateralRequired: prod.collateralRequired,
      coapplicantRequired: prod.coapplicantRequired,
      calculation: calc,
      rankScore: Math.round(rankScore * 10) / 10,
      highlights
    };
  });

  // Sort rows by rankScore descending
  rows.sort((a, b) => b.rankScore - a.rankScore);

  let bestForLowEmi: string | undefined;
  let bestForLowTotalCost: string | undefined;

  if (rows.length > 0) {
    const sortedByEmi = [...rows].sort((a, b) => a.calculation.monthlyEmiPaise - b.calculation.monthlyEmiPaise);
    bestForLowEmi = sortedByEmi[0].product_id;

    const sortedByCost = [...rows].sort((a, b) => a.calculation.totalPaymentPaise - b.calculation.totalPaymentPaise);
    bestForLowTotalCost = sortedByCost[0].product_id;
  }

  const primaryPriority = userPriorities[0] || 'low_emi';
  const rankReason = `Products ranked based on your primary preference for ${primaryPriority.replace('_', ' ')}.`;

  return {
    rows,
    bestForLowEmi,
    bestForLowTotalCost,
    rankReason
  };
}
