# SAHAJ — INTEGRATION STATUS LOG

| Sponsor / Service | Role | Operational Mode | Endpoint / Strategy | Status |
|---|---|---|---|---|
| **Cognee Cloud / Local** | Shared Knowledge Base + Per-User Memory | Live / Mock Fallback | REST API `/api/v1` (`sahaj_products_v1`, `sahaj_insurance_v1`, `sahaj_glossary_v1`, `sahaj_faq_v1`, `sahaj_journey_{user_hash}`) | Phase 2 Complete (Ingested & Vitest Passed) |
| **Sarvam AI STT** | Speech-to-Text (Saaras v3) | Live / Fixture Fallback | `https://api.sarvam.ai/speech-to-text` (code-mixed) | Ready (Smoke Scripted) |
| **Sarvam AI TTS** | Text-to-Speech (Bulbul v3) | Live / Fixture Fallback | `https://api.sarvam.ai/text-to-speech` | Ready (Smoke Scripted) |
| **Sarvam Vision** | Document Intelligence OCR | Live / Fixture Fallback | `https://api.sarvam.ai/document-digitization` | Ready (Smoke Scripted) |
| **Sarvam Chat** | Hinglish Composition LLM | Live / LLM Gateway | `sarvam-30b` / `sarvam-105b` | Ready (Smoke Scripted) |
| **n8n Automation** | Async Workflows | Live / Inline Fallback | HMAC signed Webhooks | Ready (Smoke Scripted) |
| **Paytm Fintech Connector** | Ecosystem Integration | Mock Adapter | `FintechProductConnector` (`MockPaytmAdapter`) | Ready (Synthetic Catalog) |
