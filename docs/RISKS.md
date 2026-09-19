# SAHAJ — RISK MATRIX & DEFAULTS LOG

| Risk ID | Description | Impact | Default Assumption / Mitigation | Owner | Status |
|---|---|---|---|---|---|
| R01 | **Paytm Sandbox Access** | High | Paytm APIs are NOT claimed as live. Use `FintechProductConnector` interface with `MockPaytmAdapter` and "Demo catalog — synthetic data" labels. | Engine | Closed (Mock Adapter) |
| R02 | **Cognee Cloud Quota / Latency** | High | Implement local Cognee snapshot fixtures and fallback search ladder (Graph → Chunks → Snapshot). | Data | Active |
| R03 | **Sarvam Vision API Availability** | Med | Provide fallback inline OCR digitizer and manual field-review form if Sarvam Vision is unreachable. | AI Layer | Active |
| R04 | **n8n Webhook Tunnel Egress** | Med | n8n processes async tasks only. Chat critical path works seamlessly even if n8n is offline. | Infra | Active |
| R05 | **LLM Arithmetic Hallucination** | Critical | Strict prohibition of LLM arithmetic. All money, EMI, IRR, and stress ratios computed in `packages/engines`. | Orchestrator | Closed (Code Only) |
| R06 | **Cross-User Memory Leakage** | Critical | Derive dataset names server-side using HMAC `sahaj_journey_{user_hash}`. Enforce multi-user isolation unit test. | Security | Active |
