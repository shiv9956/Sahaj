# SAHAJ — SPONSOR TECHNOLOGY USAGE PROOF DOCUMENT

**Hackathon:** Paytm Hackathon — Track 2: AI-Powered Financial Journeys  
**Team:** The NPM Tigers  

---

## 1. Cognee (Mandatory Memory & Knowledge Layer)

Cognee is essential to Sahaj's retrieval, reasoning, and memory architecture.

### Shared Knowledge Graph Datasets
- `sahaj_products_v1`: Lending product specifications, moratorium rules, fee structures.
- `sahaj_insurance_v1`: Insurance products, sum insured, exclusions, waiting periods.
- `sahaj_glossary_v1`: 80+ financial terms with EN/HI/Hinglish analogies.
- `sahaj_faq_v1`: RBI guidelines and repayment explainers.

### Isolated Per-User Journey Memory (`sahaj_journey_{user_hash}`)
- Server-derived HMAC user hash (`sahaj_journey_a3f892c...`) guarantees **0% cross-user dataset leakage**.
- Stores structured milestone statements (*goals, confirmed facts, shortlisted products, decisions*).
- **"Forget Everything" (S5):** Purges user dataset from Cognee on demand under DPDP principles.

---

## 2. Sarvam AI (Indic Language & Document Intelligence)

Sarvam AI powers Sahaj's voice, Indic composition, and document digitization pipelines.

### Speech-to-Text (Saaras v3)
- Press-and-hold mic calls Sarvam STT in code-mixed Hinglish mode.
- Surfacing **Confirmation Chips** (*"₹2,00,000, sahi hai?"*) before committing amounts to profile.

### Text-to-Speech (Bulbul v3)
- `/api/voice/speak` synthesizes spoken audio responses in Hindi/Hinglish with numeral verbalization (*"do lakh rupaye"*).

### Document Intelligence (Sarvam Vision OCR)
- Digitizes uploaded admission letters and salary slips.
- Extracts JSON schemas (*institution, course, fee, gross income, net salary*) for user review and profile auto-fill.

---

## 3. n8n (Asynchronous Out-of-Band Automation)

n8n powers Sahaj's operational workflows completely asynchronously (never on the synchronous chat loop).

### Workflows Exported as Code (`n8n/workflows/`)
1. **`wf1-document-pipeline.json`:** Receives upload webhook, verifies HMAC signature, calls Sarvam Vision, and posts extracted fields to `/internal/n8n/documents/:id/extracted`.
2. **`wf2-journey-nudge.json`:** Waits 60s (demo) / 24h (prod) on pending documents, checks journey state, and sends signed nudge links.
3. **`wf3-human-desk.json`:** Escalation ticketing (`HD-2026-XXXXXX`) using redacted journey context.
4. **`wf4-knowledge-watchdog.json`:** Daily schedule checking knowledge source effective dates and notifying stale knowledge callbacks.

### HMAC Security & Anti-Replay
- Every webhook payload is signed with `X-Sahaj-Signature` (HMAC-SHA256) and `X-Sahaj-Timestamp` with a 5-minute anti-replay window.
