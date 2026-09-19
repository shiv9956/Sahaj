import { describe, it, expect } from 'vitest';
import { calculateEMI, evaluateAffordability, parseHinglishAmount } from '@sahaj/engines';
import { MemoryLedgerManager } from '../src/cognee/memory';

describe('Phase 7: Frontend Experience & Signature Features Unit Verification', () => {
  it('S3 Regret-Proof Simulator: instant pure-TS calculations match across amounts and moratoriums', () => {
    const loanAmountPaise = 200000 * 100; // ₹2,00,000
    const annualRate = 9.5;
    const tenureMonths = 60;
    const moratoriumMonths = 12;

    const emiResult = calculateEMI(
      loanAmountPaise,
      annualRate,
      tenureMonths,
      moratoriumMonths,
      'accrue_and_capitalize'
    );

    expect(emiResult.monthlyEmiPaise).toBeGreaterThan(0);
    expect(emiResult.totalPaymentPaise).toBeGreaterThan(loanAmountPaise);

    const affordability = evaluateAffordability(
      loanAmountPaise,
      annualRate,
      tenureMonths,
      40000 * 100, // ₹40,000 monthly income
      0,
      moratoriumMonths
    );

    expect(affordability.emiToIncomePct).toBeGreaterThan(0);
    expect(['comfortable', 'stretch', 'risky']).toContain(affordability.baseVerdict);
  });

  it('S2 Hinglish Amount Parser: handles spoken and typed Hinglish amounts for confirmation chips', () => {
    const p1 = parseHinglishAmount('mujhe 2 lakh ki zarurat hai');
    expect(p1?.paise).toBe(20000000);

    const p2 = parseHinglishAmount('dedh lakh credit score check');
    expect(p2?.paise).toBe(15000000);

    const p3 = parseHinglishAmount('50 hazaar fee deposit');
    expect(p3?.paise).toBe(5000000);
  });

  it('S5 Memory Management: supports memory listing, individual deletion, and DPDP forget-all', async () => {
    const manager = new MemoryLedgerManager();
    const userId = 'user_priya_demo';

    // Clear previous
    await manager.forgetAll(userId);

    const item1 = await manager.recordMemoryStatement(
      userId,
      'Goal: ₹2,00,000 education loan for B.Tech IIT Delhi',
      'goal'
    );
    const item2 = await manager.recordMemoryStatement(
      userId,
      'Preference: Low EMI over lowest total cost',
      'preference'
    );

    expect(item1).not.toBeNull();
    expect(item2).not.toBeNull();

    let list = await manager.listUserMemories(userId);
    expect(list.length).toBe(2);

    await manager.deleteMemoryItem(userId, item1!.memory_id);
    list = await manager.listUserMemories(userId);
    expect(list.length).toBe(1);
    expect(list[0].memory_id).toBe(item2!.memory_id);

    await manager.forgetAll(userId);
    list = await manager.listUserMemories(userId);
    expect(list.length).toBe(0);
  });
});
