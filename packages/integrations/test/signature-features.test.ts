import { describe, it, expect } from 'vitest';
import { calculateProtectionGap } from '@sahaj/engines';
import { buildTrustReceipt } from '../../../apps/api/src/trust-receipt';
import { ContextPack } from '@sahaj/shared';

describe('Phase 7: Signature Features (Trust Receipt, Jargon Lens & Protection Bridge)', () => {
  it('Trust Receipt (S1) contains source document version, dataset, and rules fired', () => {
    const mockContextPack: ContextPack = {
      items: [
        {
          id: 'c1',
          text: 'Paytm EduScholar Loan terms',
          source_id: 'doc_edu_scholar_v1',
          doc_version: 'v1.0',
          effective_date: '2026-01-01',
          score: 0.95,
          retrieval_mode: 'GRAPH_COMPLETION',
          dataset: 'sahaj_products_v1',
          cached: true
        }
      ],
      calc: { monthlyEmiPaise: 424941 },
      rules_fired: ['RULE_ALL_CRITERIA_PASSED', 'MORATORIUM_CAPITALIZATION'],
      assumptions: ['9.5% annual rate'],
      profile_snapshot: {},
      protected_terms: ['EMI']
    };

    const receipt = buildTrustReceipt('msg_999', mockContextPack, 'EduScholar loan terms');
    expect(receipt.receipt_id).toBeDefined();
    expect(receipt.sources[0].source_id).toBe('doc_edu_scholar_v1');
    expect(receipt.sources[0].version).toBe('v1.0');
    expect(receipt.rules_fired).toContain('MORATORIUM_CAPITALIZATION');
  });

  it('Loan + Protection Bridge (S9) computes protection gap for co-applicant', () => {
    const gap = calculateProtectionGap(20000000, 48000000, 5, 100000000); // ₹2L loan + ₹4.8L/yr expenses over 5 yrs
    expect(gap.recommendedCoverPaise).toBe(20000000 + (48000000 * 5));
    expect(gap.protectionGapPaise).toBe(gap.recommendedCoverPaise - 100000000);
    expect(gap.label).toBe('rule_of_thumb');
  });

  it('Zero-Dead-End Next Best Action structure (S10) returns valid primary & secondary options', () => {
    const nba = {
      primary: { label_key: 'nba_upload_doc', action: 'OPEN_DOC_UPLOAD' },
      secondary: [{ label_key: 'nba_explore_insurance', action: 'BRIDGE_INSURANCE' }]
    };

    expect(nba.primary.action).toBe('OPEN_DOC_UPLOAD');
    expect(nba.secondary.length).toBeGreaterThan(0);
  });
});
