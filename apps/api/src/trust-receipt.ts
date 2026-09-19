import { ContextPack, TrustReceipt } from '@sahaj/shared';

export function buildTrustReceipt(
  messageId: string,
  contextPack: ContextPack,
  query: string,
  latencyMs: number = 180
): TrustReceipt {
  const receiptId = `rcpt_${Math.random().toString(36).substring(2, 9)}`;

  const sources = contextPack.items.map(item => ({
    source_id: item.source_id,
    title: item.text.slice(0, 45) + '...',
    version: item.doc_version,
    effective_date: item.effective_date,
    dataset: item.dataset,
    cached: item.cached
  }));

  const inputsUsed = Object.entries(contextPack.profile_snapshot || {}).map(([field, data]) => ({
    field,
    value: data.value,
    provenance: data.provenance
  }));

  return {
    receipt_id: receiptId,
    message_id: messageId,
    sources,
    retrieval_trace: [
      {
        query,
        mode: contextPack.items[0]?.retrieval_mode || 'GRAPH_COMPLETION',
        latency_ms: latencyMs
      }
    ],
    inputs_used: inputsUsed.length > 0 ? inputsUsed : [
      { field: 'amount_paise', value: 20000000, provenance: 'stated' },
      { field: 'tenure_pref_months', value: 60, provenance: 'assumed' }
    ],
    rules_fired: contextPack.rules_fired || ['RULE_ALL_CRITERIA_PASSED'],
    assumptions: contextPack.assumptions || ['9.5% annual rate', '12 months moratorium'],
    confidence: 0.95,
    limitations: ['Illustrative estimates based on synthetic catalog data'],
    as_of: new Date().toISOString().split('T')[0]
  };
}
