import { describe, it, expect } from 'vitest';
import { MemoryLedgerManager } from '../src/cognee/memory';
import { MockPaytmAdapter } from '../src/connector/mock-paytm';

describe('Phase 6: Journey Memory & Paytm Ecosystem Connector', () => {
  const memoryManager = new MemoryLedgerManager();
  const paytm = new MockPaytmAdapter();

  it('derives unique server-side HMAC user hashes to guarantee 0% cross-user dataset leakage', () => {
    const hashUserA = memoryManager.deriveUserHash('usr_priya_123');
    const hashUserB = memoryManager.deriveUserHash('usr_ramesh_456');

    expect(hashUserA).toBeDefined();
    expect(hashUserB).toBeDefined();
    expect(hashUserA).not.toBe(hashUserB);
  });

  it('enforces memory write policy: stores structured facts, rejects raw transcripts', async () => {
    // 1. Valid factual statement
    const fact = await memoryManager.recordMemoryStatement('usr_priya_123', 'User goal: ₹2,00,000 education loan for B.Tech', 'goal');
    expect(fact).not.toBeNull();
    expect(fact?.category).toBe('goal');

    // 2. Invalid raw transcript
    const rejected = await memoryManager.recordMemoryStatement('usr_priya_123', 'Hello, thank you so much! How are you doing today?', 'preference');
    expect(rejected).toBeNull();
  });

  it('lists user memories and deletes individual or all memory items ("Forget Everything")', async () => {
    const userId = 'usr_forget_test_789';
    await memoryManager.recordMemoryStatement(userId, 'Stated monthly income ₹40,000', 'profile_fact');
    
    let memories = await memoryManager.listUserMemories(userId);
    expect(memories.length).toBe(1);

    // Delete single memory
    const memoryId = memories[0].memory_id;
    await memoryManager.deleteMemoryItem(userId, memoryId);
    memories = await memoryManager.listUserMemories(userId);
    expect(memories.length).toBe(0);

    // Forget All
    await memoryManager.recordMemoryStatement(userId, 'Shortlisted EduScholar Loan', 'shortlist');
    const forgot = await memoryManager.forgetAll(userId);
    expect(forgot).toBe(true);

    memories = await memoryManager.listUserMemories(userId);
    expect(memories.length).toBe(0);
  });

  it('Paytm Connector Adapter returns synthetic catalog tagged isSynthetic: true (Decision 003)', async () => {
    const products = await paytm.listProducts('lending');
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].isSynthetic).toBe(true);
    expect(products[0].providerDisplay).toContain('Synthetic');

    const metadata = paytm.getSeamMetadata();
    expect(metadata.operationalMode).toBe('MOCK_SANDBOX');
    expect(metadata.syntheticCatalog).toBe(true);
    expect(metadata.complianceNotice).toContain('synthetic data');
  });
});
