import { CogneeClient, SearchType } from './index';
import { ContextItem, ContextPack } from '@sahaj/shared';

export interface RetrievalOptions {
  userHash?: string;
  domain?: 'lending' | 'insurance' | 'bridge' | 'general_info' | 'unknown';
  searchType?: SearchType;
  profileSnapshot?: Record<string, { value: any; provenance: 'stated' | 'extracted_from_doc' | 'assumed'; confirmed: boolean }>;
}

export class RetrievalService {
  private cognee: CogneeClient;

  constructor(cogneeClient?: CogneeClient) {
    this.cognee = cogneeClient || new CogneeClient();
  }

  /**
   * Retrieves context from Cognee knowledge datasets and user memory
   */
  async retrieveContext(query: string, options: RetrievalOptions = {}): Promise<ContextPack> {
    const domain = options.domain || 'lending';
    const primaryDataset = domain === 'insurance' ? 'sahaj_insurance_v1' : 'sahaj_products_v1';
    const searchType: SearchType = options.searchType || (query.includes('how') || query.includes('why') ? 'GRAPH_COMPLETION' : 'CHUNKS');

    let contextItems: ContextItem[] = [];

    try {
      // 1. Primary product search
      const productItems = await this.cognee.search(query, primaryDataset, searchType);
      contextItems.push(...productItems);

      // 2. Glossary lookup if query contains technical financial terms
      if (this.containsGlossaryTerms(query)) {
        const glossaryItems = await this.cognee.search(query, 'sahaj_glossary_v1', 'SUMMARIES');
        contextItems.push(...glossaryItems);
      }

      // 3. User memory lookup if userHash is provided
      if (options.userHash) {
        const memoryItems = await this.cognee.getMemory(options.userHash);
        contextItems.push(...memoryItems);
      }
    } catch (err) {
      console.warn('[RetrievalService] Error during retrieval execution:', err);
    }

    // Ensure at least fallback items if empty
    if (contextItems.length === 0) {
      contextItems = await this.cognee.search(query, primaryDataset, 'CHUNKS');
    }

    return {
      items: contextItems,
      calc: {},
      rules_fired: ['RULE_ELIGIBILITY_BASE_V1', 'RULE_REDUCING_INTEREST_V1'],
      assumptions: ['Interest accrual assumes 30 days per month', 'Illustrative figures based on synthetic catalog'],
      profile_snapshot: options.profileSnapshot || {},
      protected_terms: ['Moratorium Period', 'Co-applicant', 'Processing Fee', 'Free-Look Period']
    };
  }

  private containsGlossaryTerms(query: string): boolean {
    const terms = ['emi', 'moratorium', 'irr', 'co-applicant', 'prepayment', 'waiting period', 'co-payment', 'free-look'];
    const qLower = query.toLowerCase();
    return terms.some(t => qLower.includes(t));
  }
}
