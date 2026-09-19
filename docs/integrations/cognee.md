# COGNEE INTEGRATION RECONNAISSANCE (`docs/integrations/cognee.md`)

## Overview
Cognee serves as Sahaj's mandatory memory and knowledge layer. It manages both shared domain knowledge (lending, insurance, glossary) and private per-user journey memory.

## Datasets
- Shared Knowledge Base: `sahaj_products_v1`, `sahaj_insurance_v1`, `sahaj_glossary_v1`
- User Journey Memory: `sahaj_journey_{user_hash}` (isolated per user)

## Verified REST API Shapes
- Base URL: `https://api.cognee.ai` or tenant endpoint
- Auth Header: `X-Api-Key: <key>`
- `POST /api/v1/datasets` -> Create dataset
- `POST /api/v1/add` -> Add document/text snippet to dataset
- `POST /api/v1/cognify` -> Process entities & build graph
- `POST /api/v1/search` -> Search types: `GRAPH_COMPLETION`, `CHUNKS`, `SUMMARIES`

## Fallback Strategy
If Cognee fails or times out (2.5s threshold):
1. Redis cached response (1h TTL for shared datasets)
2. Snapshot fixtures (`data/fixtures/cognee-snapshots`)
3. Honest notice + Next Best Action + Human Desk offer
