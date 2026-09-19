import { FinancialProfile } from '@sahaj/shared';

export interface PlannedQuestion {
  targetField: keyof FinancialProfile;
  questionText: string;
  quickReplyChips: { label: string; value: any }[];
  unlockValue: number; // Higher number = unlocks more eligibility checks
}

export function planNextQuestion(
  domain: 'lending' | 'insurance' | 'bridge',
  profile: Partial<FinancialProfile>
): PlannedQuestion | null {
  if (domain === 'lending') {
    if (!profile.amount_paise?.value) {
      return {
        targetField: 'amount_paise',
        questionText: 'Aapko kitne loan amount ki zarurat hai?',
        quickReplyChips: [
          { label: '₹1,00,000', value: 10000000 },
          { label: '₹2,00,000', value: 20000000 },
          { label: '₹5,00,000', value: 50000000 },
          { label: '₹10,00,000', value: 100000000 }
        ],
        unlockValue: 10
      };
    }

    if (!profile.coapplicant_monthly_income_paise?.value) {
      return {
        targetField: 'coapplicant_monthly_income_paise',
        questionText: 'Co-applicant (Mummy/Papa) ki monthly income kitni hai?',
        quickReplyChips: [
          { label: '₹25,000 / month', value: 2500000 },
          { label: '₹40,000 / month', value: 4000000 },
          { label: '₹60,000 / month', value: 6000000 },
          { label: '₹1,00,000 / month', value: 10000000 }
        ],
        unlockValue: 9
      };
    }

    if (!profile.tenure_pref_months?.value) {
      return {
        targetField: 'tenure_pref_months',
        questionText: 'Aap kitne samay (tenure) mein repayment karna chahenge?',
        quickReplyChips: [
          { label: '3 Years (36 m)', value: 36 },
          { label: '5 Years (60 m)', value: 60 },
          { label: '7 Years (84 m)', value: 84 }
        ],
        unlockValue: 7
      };
    }
  }

  if (domain === 'insurance') {
    if (!profile.cover_type?.value) {
      return {
        targetField: 'cover_type',
        questionText: 'Aap kis prakar ki insurance protection dekh rahe hain?',
        quickReplyChips: [
          { label: 'Term Life Insurance', value: 'term_life' },
          { label: 'Health Shield Insurance', value: 'health' },
          { label: 'Loan Protection Bridge', value: 'loan_protection' }
        ],
        unlockValue: 10
      };
    }
  }

  return null;
}
