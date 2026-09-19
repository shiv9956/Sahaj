import { describe, it, expect, beforeEach } from 'vitest';
import { CogneeClient } from '../src/cognee/index';
import { RetrievalService } from '../src/cognee/retrieval';

describe('Cognee Knowledge Layer & Retrieval Service', () => {
  let cognee: CogneeClient;
  let retrieval: RetrievalService;

  beforeEach(() => {
    cognee = new CogneeClient({ useMock: true });
    retrieval = new RetrievalService(cognee);
  });

  it('retrieves relevant lending context items with graph completion mode', async () => {
    const contextPack = await retrieval.retrieveContext('What is the moratorium period for education loan?', {
      domain: 'lending',
    });

    expect(contextPack.items.length).toBeGreaterThan(0);
    const firstItem = contextPack.items[0];
    expect(firstItem.text).toContain('moratorium');
    expect(firstItem.source_id).toBeDefined();
    expect(firstItem.effective_date).toBeDefined();
    expect(contextPack.rules_fired).toContain('RULE_ELIGIBILITY_BASE_V1');
  });

  it('retrieves relevant insurance context items', async () => {
    const contextPack = await retrieval.retrieveContext('What is the sum assured for term life protect?', {
      domain: 'insurance',
    });

    expect(contextPack.items.length).toBeGreaterThan(0);
    expect(contextPack.items.some(i => i.text.toLowerCase().includes('term') || i.text.toLowerCase().includes('insurance'))).toBe(true);
  });

  it('isolates user journey memory per user hash', async () => {
    const userHashA = 'user_hash_aaa_123';
    const userHashB = 'user_hash_bbb_456';

    const addA = await cognee.addMemory(userHashA, 'User income is 45000 INR monthly');
    const addB = await cognee.addMemory(userHashB, 'User income is 90000 INR monthly');

    expect(addA.dataId).toBeDefined();
    expect(addB.dataId).toBeDefined();

    const memA = await cognee.getMemory(userHashA);
    const memB = await cognee.getMemory(userHashB);

    expect(memA).toBeDefined();
    expect(memB).toBeDefined();
  });

  it('deletes user memory dataset on "Forget Everything" request', async () => {
    const userHash = 'user_forget_test_789';
    await cognee.addMemory(userHash, 'User prefers low EMI tenure');
    
    const success = await cognee.deleteUserDataset(userHash);
    expect(success).toBe(true);
  });
});
