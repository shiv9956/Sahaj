# n8n AUTOMATION INTEGRATION RECONNAISSANCE (`docs/integrations/n8n.md`)

## Overview
n8n executes asynchronous background workflows so that the main SSE chat pipeline is never blocked by long-running operations.

## Security & Signature Specification
- Every incoming event from `apps/api` to n8n is signed with `X-Sahaj-Signature` (HMAC-SHA256) and `X-Sahaj-Timestamp`.
- Replay prevention: reject timestamps older than 5 minutes.
- Idempotency key: `Idempotency-Key` header prevents duplicate execution.

## Workflows
1. `WF-1`: Document digitization pipeline (Sarvam Vision async callback).
2. `WF-2`: Journey continuity & drop-off nudge dispatcher.
3. `WF-3`: Human Desk escalation ticket generator.
4. `WF-4`: Knowledge base freshness watchdog.
5. `WF-5`: Daily analytics rollup.
