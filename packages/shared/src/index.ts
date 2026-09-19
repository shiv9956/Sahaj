import { z } from 'zod';

// Journey State Machine Enums
export const JourneyStateSchema = z.enum([
  'NEW',
  'INTENT_CAPTURED',
  'PROFILE_INCOMPLETE',
  'PROFILE_READY',
  'KNOWLEDGE_RETRIEVED',
  'OPTIONS_READY',
  'DOCUMENTS_PENDING',
  'APPLICATION_GUIDANCE',
  'FOLLOW_UP'
]);
export type JourneyState = z.infer<typeof JourneyStateSchema>;

// Intent Extraction Schema (Appendix B)
export const IntentResultSchema = z.object({
  language: z.enum(['en', 'hi', 'hinglish', 'mixed']),
  domain: z.enum(['lending', 'insurance', 'bridge', 'general_info', 'unknown']),
  purpose: z.string().optional(),
  amount: z.object({
    paise: z.number(),
    raw: z.string(),
    confidence: z.number()
  }).optional(),
  tenure: z.object({
    months: z.number(),
    raw: z.string(),
    confidence: z.number()
  }).optional(),
  income_hint: z.object({
    raw: z.string(),
    band: z.string().optional()
  }).optional(),
  obligations_hint: z.object({ raw: z.string() }).optional(),
  priorities: z.array(z.enum(['low_emi', 'low_total_cost', 'flexibility', 'speed', 'protection'])),
  urgency: z.enum(['low', 'normal', 'high']),
  needs_human: z.boolean(),
  confidence: z.number()
});
export type IntentResult = z.infer<typeof IntentResultSchema>;

// Context Item Schema
export const ContextItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  source_id: z.string(),
  doc_version: z.string(),
  effective_date: z.string(),
  score: z.number(),
  retrieval_mode: z.string(),
  dataset: z.string(),
  cached: z.boolean()
});
export type ContextItem = z.infer<typeof ContextItemSchema>;

// Context Pack Schema
export const ContextPackSchema = z.object({
  items: z.array(ContextItemSchema),
  calc: z.record(z.any()),
  rules_fired: z.array(z.string()),
  assumptions: z.array(z.string()),
  profile_snapshot: z.record(z.object({
    value: z.any(),
    provenance: z.enum(['stated', 'extracted_from_doc', 'assumed']),
    confirmed: z.boolean()
  })),
  protected_terms: z.array(z.string())
});
export type ContextPack = z.infer<typeof ContextPackSchema>;

// Trust Receipt Schema (Appendix B)
export const TrustReceiptSchema = z.object({
  receipt_id: z.string(),
  message_id: z.string(),
  sources: z.array(z.object({
    source_id: z.string(),
    title: z.string(),
    version: z.string(),
    effective_date: z.string(),
    dataset: z.string(),
    cached: z.boolean()
  })),
  retrieval_trace: z.array(z.object({
    query: z.string(),
    mode: z.string(),
    latency_ms: z.number()
  })),
  inputs_used: z.array(z.object({
    field: z.string(),
    value: z.any(),
    provenance: z.string()
  })),
  rules_fired: z.array(z.string()),
  assumptions: z.array(z.string()),
  confidence: z.number(),
  limitations: z.array(z.string()),
  as_of: z.string()
});
export type TrustReceipt = z.infer<typeof TrustReceiptSchema>;

// Next Best Action Schema (Appendix B)
export const NextBestActionSchema = z.object({
  primary: z.object({
    label_key: z.string(),
    action: z.string()
  }),
  secondary: z.array(z.object({
    label_key: z.string(),
    action: z.string()
  })).optional()
});
export type NextBestAction = z.infer<typeof NextBestActionSchema>;

// Financial Profile Schema
export const FinancialProfileFieldSchema = z.object({
  value: z.any(),
  provenance: z.enum(['stated', 'extracted_from_doc', 'assumed']),
  confirmed: z.boolean(),
  confidence: z.number().optional()
});

export const FinancialProfileSchema = z.object({
  user_id: z.string(),
  borrower_role: FinancialProfileFieldSchema.optional(),
  amount_paise: FinancialProfileFieldSchema.optional(),
  tenure_months: FinancialProfileFieldSchema.optional(),
  tenure_pref_months: FinancialProfileFieldSchema.optional(),
  coapplicant_monthly_income_paise: FinancialProfileFieldSchema.optional(),
  existing_emi_paise: FinancialProfileFieldSchema.optional(),
  affordable_emi_paise: FinancialProfileFieldSchema.optional(),
  collateral_willingness: FinancialProfileFieldSchema.optional(),
  cover_type: FinancialProfileFieldSchema.optional(),
  priority_ranking: z.array(z.string()).optional()
});
export type FinancialProfile = z.infer<typeof FinancialProfileSchema>;
