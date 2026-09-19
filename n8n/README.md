# Sahaj n8n Workflows (Asynchronous Workflows as Code)

This directory contains versioned n8n workflow definitions in JSON format for **Sahaj** (Paytm Hackathon Track 2).

> **Architectural Principle:** n8n operates strictly out-of-band (asynchronously). Nothing in the chat response loop waits on n8n. All callbacks are protected by HMAC-SHA256 signatures with 5-minute anti-replay protection.

---

## Included Workflows

1. **`wf1-document-pipeline.json` (WF-1 Document Intelligence Autopilot):**
   - Webhook trigger: `POST /webhook/document-uploaded`
   - Verifies HMAC signature, triggers Sarvam Vision digitization, and posts extracted fields to `/internal/n8n/documents/:id/extracted`.

2. **`wf2-journey-nudge.json` (WF-2 Journey Continuity Nudge):**
   - Webhook trigger: `POST /webhook/journey-documents-pending`
   - Waits 60s (demo) or 24h (prod), checks if documents are still pending, and dispatches a signed nudge callback to `/internal/n8n/nudges/:id/sent`.

3. **`wf3-human-desk.json` (WF-3 Zero-Dead-End Human Desk Escalation):**
   - Webhook trigger: `POST /webhook/escalation-requested`
   - Generates a support ticket (`HD-2026-XXXXXX`) using redacted journey context and posts ticket receipt to `/internal/n8n/escalations/:id/acknowledged`.

4. **`wf4-knowledge-watchdog.json` (WF-4 Living Knowledge Freshness Watchdog):**
   - Schedule trigger: Daily cron or manual trigger.
   - Checks knowledge source effective dates and notifies `/internal/n8n/knowledge/stale`.

---

## Import Instructions

1. Open your n8n web interface (e.g. `http://localhost:5678`).
2. Click **Workflows** -> **Import from File**.
3. Select any of the JSON files in this directory.
4. Set environment variables in n8n or docker-compose:
   - `HMAC_SECRET`: Must match API `HMAC_SECRET` (default: `sahaj_demo_secret_key_2026`).
   - `SARVAM_API_KEY`: Your Sarvam AI key.
