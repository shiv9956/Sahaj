# SAHAJ — DECISION LOG (`docs/DECISIONS.md`)

## Decision 001: Pure TypeScript Monorepo with pnpm
- **Date:** 2026-09-19
- **Context:** Need unified type definitions between API, frontend, engines, and integration layers.
- **Decision:** Use pnpm workspaces with Next.js App Router for `apps/web`, Fastify for `apps/api`, and pure TS packages for `shared`, `engines`, and `integrations`.
- **Consequences:** End-to-end type safety, fast build times, instant slider calculations in browser using shared `packages/engines`.

## Decision 002: Deterministic Calculation Guard (No LLM Math)
- **Date:** 2026-09-19
- **Context:** Financial precision is mandatory in fintech. LLMs hallucinate numbers and rates.
- **Decision:** All financial calculations (EMI schedules, moratorium interest, IRR effective annual cost, stress testing, affordability ratios) are executed strictly by pure TS functions in `packages/engines`.
- **Consequences:** 100% mathematical accuracy, zero financial hallucinations, reproducible Trust Receipts.

## Decision 003: Ecosystem Connector Seam for Paytm
- **Date:** 2026-09-19
- **Context:** Paytm hackathon rules requiring honest presentation without fake integrations.
- **Decision:** Build a `FintechProductConnector` interface with `MockPaytmAdapter` serving synthetic data tagged `"synthetic: true"`. Real Paytm sandbox endpoints can be swapped in seamlessly when access is granted.
- **Consequences:** Honest demo, clear path to production, compliance with rules.

## Decision 004: Dual Cognee Memory Datasets
- **Date:** 2026-09-19
- **Context:** Need shared factual knowledge graph plus private per-user journey memory.
- **Decision:** Store shared catalog/glossary in `sahaj_products_v1` and `sahaj_glossary_v1`. Store user journey memory in server-derived `sahaj_journey_{user_hash}` datasets with explicit consent and "Forget everything" capability.
- **Consequences:** Clean separation of concerns, strict privacy isolation, zero cross-user memory leaks.
