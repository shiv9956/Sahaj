import { describe, it, expect } from 'vitest';
import { 
  Money, 
  calculateEMI, 
  evaluateAffordability, 
  parseHinglishAmount, 
  parseHinglishDuration,
  scoreFinePrintRadar,
  buildProductComparison,
  calculateInsuranceIllustration,
  calculateProtectionGap
} from './index.js';

describe('Deterministic Engines Test Suite', () => {
  it('Money Primitives: converts rupees, formats INR, verbalizes Hinglish', () => {
    const m = Money.fromRupees(200000);
    expect(m.paise).toBe(20000000);
    expect(m.formatINR()).toBe('₹2,00,000');
    expect(m.verbalize('hinglish')).toBe('2 lakh rupees');

    const dedh = Money.fromRupees(150000);
    expect(dedh.verbalize('hinglish')).toBe('dedh lakh rupees');
  });

  it('EMI Calculator: reducing balance EMI matches standard mathematical PMT formula', () => {
    // ₹2,00,000 loan at 10% for 5 years (60 months)
    const res = calculateEMI(20000000, 10, 60);
    expect(res.monthlyEmiPaise).toBe(424941); // ₹4,249.41 per month
    expect(res.schedule.length).toBe(60);
    expect(res.schedule[59].remainingBalancePaise).toBe(0); // Amortization closes to 0
  });

  it('Property Test Invariant: Amortization schedule sum equals total principal repaid', () => {
    const res = calculateEMI(50000000, 12, 48); // ₹5,00,000 loan at 12% for 48 months
    const totalPrincipalRepaid = res.schedule.reduce((acc, row) => acc + row.principalPaise, 0);
    expect(totalPrincipalRepaid).toBe(50000000);
  });

  it('Property Test Invariant: Higher interest rate yields higher EMI and total interest', () => {
    const lowRate = calculateEMI(20000000, 8.5, 60);
    const highRate = calculateEMI(20000000, 12.5, 60);
    expect(highRate.monthlyEmiPaise).toBeGreaterThan(lowRate.monthlyEmiPaise);
    expect(highRate.totalInterestPaise).toBeGreaterThan(lowRate.totalInterestPaise);
  });

  it('Education Moratorium: computes simple vs compounding moratorium interest', () => {
    const compounding = calculateEMI(20000000, 10, 60, 12, 'accrue_and_capitalize');
    expect(compounding.moratoriumDetails?.moratoriumInterestPaise).toBeGreaterThan(0);
    expect(compounding.moratoriumDetails?.effectivePrincipalPaise).toBeGreaterThan(20000000);
  });

  it('Affordability & Stress Test: assesses income ratio and stress scenarios', () => {
    const aff = evaluateAffordability(20000000, 10, 60, 5000000); // 50k monthly income
    expect(aff.baseVerdict).toBe('comfortable');
    expect(aff.stressScenarios.length).toBe(3);
  });

  it('Fine-Print Radar Engine: scores clauses based on severity and user priorities', () => {
    const clauses = [
      { clause_id: 'c1', tag: 'prepayment' as const, title: 'Prepayment Penalty', text: '3% penalty within 12 months', severity: 4 },
      { clause_id: 'c2', tag: 'processing_fee' as const, title: 'Upfront Processing Fee', text: '₹2,000 processing fee', severity: 2 }
    ];

    const scored = scoreFinePrintRadar(clauses, ['flexibility']);
    expect(scored[0].clause_id).toBe('c1');
    expect(scored[0].relevanceScore).toBeGreaterThan(4);
  });

  it('Comparison Builder Engine: ranks products by user priority', () => {
    const products = [
      {
        product_id: 'p1',
        title: 'EduScholar Premier',
        provider_display: 'Paytm Partner A',
        annualRatePct: 9.5,
        processingFeePaise: 100000,
        maxTenureMonths: 84,
        moratoriumMonths: 6,
        collateralRequired: false,
        coapplicantRequired: true
      },
      {
        product_id: 'p2',
        title: 'FlexiEdu Line',
        provider_display: 'Paytm Partner B',
        annualRatePct: 13.0,
        processingFeePaise: 50000,
        maxTenureMonths: 36,
        moratoriumMonths: 0,
        collateralRequired: false,
        coapplicantRequired: false
      }
    ];

    const comparison = buildProductComparison(products, 20000000, 60, ['low_emi']);
    expect(comparison.rows.length).toBe(2);
    expect(comparison.bestForLowEmi).toBe('p1');
  });

  it('Insurance Premium Illustration & Protection Gap Engine', () => {
    const illustration = calculateInsuranceIllustration('prod_ins_01', 500000000, '26-35');
    expect(illustration.annualPremiumPaise).toBeGreaterThan(0);
    expect(illustration.label).toBe('illustrative');

    const gap = calculateProtectionGap(20000000, 36000000, 5, 100000000);
    expect(gap.recommendedCoverPaise).toBe(20000000 + (36000000 * 5));
    expect(gap.protectionGapPaise).toBe(gap.recommendedCoverPaise - 100000000);
    expect(gap.label).toBe('rule_of_thumb');
  });

  it('Hinglish Amount & Duration Parser: parses various Indian amount expressions', () => {
    expect(parseHinglishAmount('2 lakh')?.paise).toBe(20000000);
    expect(parseHinglishAmount('do lakh')?.paise).toBe(20000000);
    expect(parseHinglishAmount('दो लाख')?.paise).toBe(20000000);
    expect(parseHinglishAmount('dedh lakh')?.paise).toBe(15000000);
    expect(parseHinglishAmount('dhai lakh')?.paise).toBe(25000000);
    expect(parseHinglishAmount('sava lakh')?.paise).toBe(12500000);
    expect(parseHinglishAmount('pachas hazaar')?.paise).toBe(5000000);
    expect(parseHinglishAmount('20k')?.paise).toBe(2000000);
    expect(parseHinglishDuration('5 saal')?.months).toBe(60);
    expect(parseHinglishDuration('paanch saal')?.months).toBe(60);
    expect(parseHinglishDuration('60 mahine')?.months).toBe(60);
  });
});
