import crypto from 'crypto';
import { CogneeClient } from './index';

export interface MemoryLedgerItem {
  memory_id: string;
  user_id: string;
  user_hash: string;
  statement: string;
  category: 'goal' | 'profile_fact' | 'decision' | 'shortlist' | 'preference';
  created_at: string;
}

export class MemoryLedgerManager {
  private cognee: CogneeClient;
  private secret: string;
  private memoryStore: Map<string, MemoryLedgerItem[]> = new Map();

  constructor(cogneeClient?: CogneeClient) {
    this.cognee = cogneeClient || new CogneeClient();
    this.secret = process.env.HMAC_SECRET || 'sahaj_demo_secret_key_2026';
  }

  /**
   * Derive server-side HMAC user hash to isolate Cognee datasets
   */
  deriveUserHash(userId: string): string {
    return crypto
      .createHmac('sha256', this.secret)
      .update(userId)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Enforces Memory Write Policy: stores structured facts only, rejects raw transcripts
   */
  async recordMemoryStatement(
    userId: string,
    statement: string,
    category: MemoryLedgerItem['category']
  ): Promise<MemoryLedgerItem | null> {
    // Reject raw transcript-like inputs
    if (statement.length > 250 || statement.includes('\n\n') || /\b(hello|hi|hey|thanks|thank you)\b/i.test(statement)) {
      console.warn('[MemoryLedger] Statement rejected by write policy (raw transcript or non-factual text).');
      return null;
    }

    const userHash = this.deriveUserHash(userId);
    const memoryId = `mem_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();

    // 1. Write to Cognee isolated dataset
    await this.cognee.addMemory(userHash, `[${category.toUpperCase()}] ${statement}`);

    // 2. Store in local ledger
    const item: MemoryLedgerItem = {
      memory_id: memoryId,
      user_id: userId,
      user_hash: userHash,
      statement,
      category,
      created_at: createdAt
    };

    const userMemories = this.memoryStore.get(userId) || [];
    userMemories.push(item);
    this.memoryStore.set(userId, userMemories);

    return item;
  }

  /**
   * List active memory statements for a user
   */
  async listUserMemories(userId: string): Promise<MemoryLedgerItem[]> {
    return this.memoryStore.get(userId) || [];
  }

  /**
   * Delete single memory item
   */
  async deleteMemoryItem(userId: string, memoryId: string): Promise<boolean> {
    const memories = this.memoryStore.get(userId) || [];
    const filtered = memories.filter(m => m.memory_id !== memoryId);
    this.memoryStore.set(userId, filtered);
    return true;
  }

  /**
   * Forget Everything: Purges user dataset from Cognee & local ledger
   */
  async forgetAll(userId: string): Promise<boolean> {
    const userHash = this.deriveUserHash(userId);
    await this.cognee.deleteUserDataset(userHash);
    this.memoryStore.delete(userId);
    return true;
  }
}
