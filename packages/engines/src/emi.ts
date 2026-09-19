import Decimal from 'decimal.js';
import { Money } from './money';

export interface EmiScheduleRow {
  month: number;
  paymentPaise: number;
  principalPaise: number;
  interestPaise: number;
  remainingBalancePaise: number;
}

export interface EmiCalculationResult {
  monthlyEmiPaise: number;
  totalInterestPaise: number;
  totalPaymentPaise: number;
  effectiveAnnualRatePct: number;
  schedule: EmiScheduleRow[];
  moratoriumDetails?: {
    moratoriumMonths: number;
    interestMode: 'pay_simple_interest' | 'accrue_and_capitalize';
    moratoriumInterestPaise: number;
    effectivePrincipalPaise: number;
  };
}

export function calculateEMI(
  principalPaise: number,
  annualRatePct: number,
  tenureMonths: number,
  moratoriumMonths: number = 0,
  interestMode: 'pay_simple_interest' | 'accrue_and_capitalize' = 'accrue_and_capitalize',
  processingFeePaise: number = 0
): EmiCalculationResult {
  let effectivePrincipal = principalPaise;
  let moratoriumInterestPaise = 0;

  // Moratorium calculation for education loans
  if (moratoriumMonths > 0 && annualRatePct > 0) {
    const monthlyRate = annualRatePct / 12 / 100;
    if (interestMode === 'pay_simple_interest') {
      moratoriumInterestPaise = Math.round(principalPaise * monthlyRate * moratoriumMonths);
    } else {
      // Capitalize interest
      const capitalized = principalPaise * Math.pow(1 + monthlyRate, moratoriumMonths);
      moratoriumInterestPaise = Math.round(capitalized - principalPaise);
      effectivePrincipal = Math.round(capitalized);
    }
  }

  const P = new Decimal(effectivePrincipal);
  const r = new Decimal(annualRatePct).div(12).div(100);
  const n = tenureMonths;

  let monthlyEmiPaise = 0;
  if (annualRatePct === 0) {
    monthlyEmiPaise = Math.round(effectivePrincipal / n);
  } else {
    // E = P * r * (1+r)^n / ((1+r)^n - 1)
    const factor = r.plus(1).pow(n);
    const emiDec = P.times(r).times(factor).div(factor.minus(1));
    monthlyEmiPaise = Math.round(emiDec.toNumber());
  }

  // Generate Amortization Schedule
  let currentBalance = effectivePrincipal;
  const schedule: EmiScheduleRow[] = [];
  let totalInterestAccrued = 0;

  const monthlyRateNum = annualRatePct / 12 / 100;
  for (let m = 1; m <= n; m++) {
    const interestPaise = Math.round(currentBalance * monthlyRateNum);
    let principalPaise = monthlyEmiPaise - interestPaise;

    if (m === n) {
      // Last month adjustment to close balance exactly to 0
      principalPaise = currentBalance;
    }

    currentBalance = Math.max(0, currentBalance - principalPaise);
    totalInterestAccrued += interestPaise;

    schedule.push({
      month: m,
      paymentPaise: principalPaise + interestPaise,
      principalPaise,
      interestPaise,
      remainingBalancePaise: currentBalance,
    });
  }

  const totalPaymentPaise = (monthlyEmiPaise * n) + processingFeePaise + (interestMode === 'pay_simple_interest' ? moratoriumInterestPaise : 0);
  const totalInterestPaise = totalInterestAccrued + moratoriumInterestPaise;

  // Effective Annual Rate (Approximate IRR with fees)
  const effectiveAnnualRatePct = annualRatePct + (processingFeePaise > 0 ? (processingFeePaise / principalPaise) * (12 / n) * 100 : 0);

  return {
    monthlyEmiPaise,
    totalInterestPaise,
    totalPaymentPaise,
    effectiveAnnualRatePct: Math.round(effectiveAnnualRatePct * 100) / 100,
    schedule,
    moratoriumDetails: moratoriumMonths > 0 ? {
      moratoriumMonths,
      interestMode,
      moratoriumInterestPaise,
      effectivePrincipalPaise: effectivePrincipal
    } : undefined
  };
}
