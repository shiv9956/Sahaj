import { FinancialProfile } from '@sahaj/shared';

export type EligibilityStatus = 'likely_meets' | 'may_not_meet' | 'unknown';

export interface EligibilityResult {
  status: EligibilityStatus;
  rule_ids: string[];
  reasons: string[];
  missing_fields: string[];
}

export function evaluateEligibility(
  profile: Partial<FinancialProfile>,
  productRules: {
    minIncomePaise?: number;
    maxAmountPaise?: number;
    requireCoapplicant?: boolean;
    requireCollateral?: boolean;
    maxTenureMonths?: number;
  }
): EligibilityResult {
  const rule_ids: string[] = [];
  const reasons: string[] = [];
  const missing_fields: string[] = [];

  // Check required profile fields
  if (!profile.amount_paise?.value) {
    missing_fields.push('amount_paise');
  }
  if (!profile.coapplicant_monthly_income_paise?.value) {
    missing_fields.push('coapplicant_monthly_income_paise');
  }

  if (missing_fields.length > 0) {
    return {
      status: 'unknown',
      rule_ids: ['RULE_PROFILE_INCOMPLETE'],
      reasons: [`Need profile information for: ${missing_fields.join(', ')}`],
      missing_fields
    };
  }

  const amountPaise = profile.amount_paise!.value as number;
  const incomePaise = profile.coapplicant_monthly_income_paise!.value as number;
  const hasCollateral = profile.collateral_willingness?.value === 'yes' || profile.collateral_willingness?.value === true;

  // Rule 1: Income Check
  if (productRules.minIncomePaise && incomePaise < productRules.minIncomePaise) {
    rule_ids.push('RULE_MIN_INCOME');
    reasons.push(`Stated income is below the required threshold of ₹${productRules.minIncomePaise / 100}`);
  }

  // Rule 2: Max Loan Amount Check
  if (productRules.maxAmountPaise && amountPaise > productRules.maxAmountPaise) {
    rule_ids.push('RULE_MAX_AMOUNT');
    reasons.push(`Requested amount exceeds maximum threshold of ₹${productRules.maxAmountPaise / 100}`);
  }

  // Rule 3: Collateral Check
  if (productRules.requireCollateral && !hasCollateral) {
    rule_ids.push('RULE_COLLATERAL_REQUIRED');
    reasons.push('This product requires collateral or security asset');
  }

  if (reasons.length > 0) {
    return {
      status: 'may_not_meet',
      rule_ids,
      reasons,
      missing_fields: []
    };
  }

  return {
    status: 'likely_meets',
    rule_ids: ['RULE_ALL_CRITERIA_PASSED'],
    reasons: ['Likely meets stated eligibility criteria based on provided profile'],
    missing_fields: []
  };
}
