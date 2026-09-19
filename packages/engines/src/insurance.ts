import { Money } from './money';

export interface InsurancePremiumIllustration {
  product_id: string;
  sumInsuredPaise: number;
  ageBand: '18-25' | '26-35' | '36-45' | '46-60';
  annualPremiumPaise: number;
  monthlyPremiumPaise: number;
  annualPremiumFormatted: string;
  monthlyPremiumFormatted: string;
  label: 'illustrative';
}

export interface ProtectionGapAnalysis {
  outstandingDebtPaise: number;
  annualLivingExpensePaise: number;
  horizonYears: number;
  totalDependentsExpensePaise: number;
  recommendedCoverPaise: number;
  recommendedCoverFormatted: string;
  protectionGapPaise: number;
  protectionGapFormatted: string;
  label: 'rule_of_thumb';
}

export function calculateInsuranceIllustration(
  product_id: string,
  sumInsuredPaise: number,
  ageBand: '18-25' | '26-35' | '36-45' | '46-60'
): InsurancePremiumIllustration {
  // Synthetic Rate Table per 1 Lakh Sum Insured
  const baseRatePerLakhMap: Record<string, number> = {
    '18-25': 450,  // ₹450 annual per ₹1 Lakh cover
    '26-35': 650,  // ₹650 annual per ₹1 Lakh cover
    '36-45': 1100, // ₹1,100 annual per ₹1 Lakh cover
    '46-60': 2200, // ₹2,200 annual per ₹1 Lakh cover
  };

  const baseRateRupees = baseRatePerLakhMap[ageBand] || 650;
  const lakhs = (sumInsuredPaise / 100) / 100000;
  const annualPremiumRupees = Math.round(lakhs * baseRateRupees);
  const annualPremiumPaise = annualPremiumRupees * 100;
  const monthlyPremiumPaise = Math.round(annualPremiumPaise / 12);

  return {
    product_id,
    sumInsuredPaise,
    ageBand,
    annualPremiumPaise,
    monthlyPremiumPaise,
    annualPremiumFormatted: new Money(annualPremiumPaise).formatINR(),
    monthlyPremiumFormatted: new Money(monthlyPremiumPaise).formatINR(),
    label: 'illustrative'
  };
}

export function calculateProtectionGap(
  outstandingDebtPaise: number,
  annualLivingExpensePaise: number,
  horizonYears: number = 5,
  existingCoverPaise: number = 0
): ProtectionGapAnalysis {
  const totalDependentsExpensePaise = annualLivingExpensePaise * horizonYears;
  const recommendedCoverPaise = outstandingDebtPaise + totalDependentsExpensePaise;
  const protectionGapPaise = Math.max(0, recommendedCoverPaise - existingCoverPaise);

  return {
    outstandingDebtPaise,
    annualLivingExpensePaise,
    horizonYears,
    totalDependentsExpensePaise,
    recommendedCoverPaise,
    recommendedCoverFormatted: new Money(recommendedCoverPaise).formatINR(),
    protectionGapPaise,
    protectionGapFormatted: new Money(protectionGapPaise).formatINR(),
    label: 'rule_of_thumb'
  };
}
