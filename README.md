# SAHAJ — सहज

> **AI-Powered Financial Journey Companion**
> *Paytm Hackathon · Track 2: AI-Powered Financial Journeys*
> **Team:** The NPM Tigers | **Stack:** Next.js (PWA), Fastify (API), TypeScript, Cognee, Sarvam AI, n8n, MongoDB Atlas, Redis

---

## 📌 One-Line Thesis

*Clarity before credit.* The primary barrier in Indian retail finance is not access—it is comprehension: jargon, regional language friction, opaque calculations, and hidden fine print.

**Sahaj** is a journey engine (not a generic chatbot) that translates spoken or typed aspirations—like *"Mujhe ₹2 lakh ki zarurat hai education ke liye"*—into structured, evidence-backed, step-by-step financial journeys across credit and insurance.

---

## 🏆 Core Capabilities

| Feature ID | Feature | Description | Engine / Integration |
| --- | --- | --- | --- |
| **S1** | **Trust Receipt** | Every rate, calculation, or eligibility claim carries verifiable citations: retrieved sources, active rules, and mathematical assumptions. | **Cognee** |
| **S2** | **Bol-Kar-Samjho** | Voice-first multilingual and Hinglish interaction with press-to-talk audio and explicit **Confirmation Chips** for financial values. | **Sarvam AI (Saaras v3)** |
| **S3** | **Regret-Proof Simulator** | Real-time browser-evaluated sliders for principal, tenure, and moratorium with EMI, IRR (annual cost), and DTI stress tests. | Pure-TS `@sahaj/engines` |
| **S4** | **Jargon Lens** | Contextual explanations for complex terms (*Moratorium, Capitalization, IRR, Co-applicant, Free-Look*) with analogies. | **Cognee + Sarvam AI** |
| **S5** | **Isolated Journey Memory** | Session memory mapped with tenant isolation and DPDP-compliant **"Forget Everything"** complete data purging. | **Cognee** |
| **S6** | **Document Autopilot** | Upload admission letters or salary slips for OCR parsing, schema verification, and automatic profile extraction. | **Sarvam Vision + n8n** |
| **S7** | **Glass-Box Judge Mode** | Side telemetry panel (`?judge=1`) tracking live Cognee retrieval paths, LLM reasoning gates, and state machine transitions. | Platform Telemetry |
| **S8** | **Fine-Print Radar** | Surfaces personalized hidden costs and gotchas (e.g., moratorium interest capitalization, early repayment penalties). | **Cognee** |
| **S9** | **Loan + Protection Bridge** | Identifies student loan protection gaps and maps relevant term insurance safeguards directly into the flow. | **Cognee** |
| **S10** | **Zero-Dead-End Guarantee** | Every turn resolves with a deterministic **Next Best Action** CTA and optional human escalation route. | **n8n** |
| **S11** | **Chaos Mode** | Built-in resilience testing toggle (`?chaos=1`) demonstrating fallback to local cached snapshots during downstream outages. | Core Orchestrator |

---

## 🏗 Architecture & System Topology

```
                         ┌────────────────────────────────────────────────────┐
   USER (Voice / Text) ─►│ NEXT.JS WEB CLIENT (PWA)                           │
                         │ Chat · Journey Rail · Simulator · Compare · Docs   │
                         │ Trust Receipt · Memory Control · Judge Mode        │
                         │ Shared pure-TS `engines` runs client-side          │
                         └───────────────┬────────────────────────────────────┘
                                         │ HTTPS + SSE
                         ┌───────────────▼────────────────────────────────────┐
                         │ FASTIFY API (Node.js, TypeScript)                  │
                         │ Auth/Session · Rate Limiting · Request Tracing     │
                         │ ORCHESTRATOR (Sync Execution Path):                │
                         │  Lang Detect → Parse → State Machine → Tools →     │
                         │  Context Pack → LLM Gateway → GROUNDING GATE →     │
                         │  SSE Stream → Trust Receipt Delivery               │
                         └──┬──────┬───────┬────────┬─────────┬───────────────┘
                            │      │       │        │         │
                  ┌─────────▼┐ ┌───▼────┐ ┌▼──────┐ ┌▼───────┐ ┌▼────────────┐
                  │ COGNEE   │ │ ENGINES│ │ LLM   │ │ SARVAM │ │ PRODUCT    │
                  │ Shared KB│ │ (Pure  │ │GATEWAY│ │ STT/TTS│ │ CONNECTOR  │
                  │ + User   │ │ TS math│ │Sarvam │ │ Vision │ │ Mock Paytm │
                  │ Memory   │ │ logic) │ │/ Claude│ │ Xlate │ │ (Pluggable)│
                  └──────────┘ └────────┘ └───────┘ └────────┘ └─────────────┘
                            │
               ┌────────────▼──────────┐   Outbox    ┌──────────────────────────┐
               │ MONGODB · REDIS       │────────────►│ n8n (Async Workflows)    │
               │ Document Storage      │◄────────────│ OCR pipeline · Nudges    │
               └───────────────────────┘  Callbacks  │ Escalation · Freshness   │
                                           (HMAC)    └──────────────────────────┘

```

---

## 🚀 Quick Start Guide

### Prerequisites

* **Node.js** >= 18.0.0
* **pnpm** >= 8.0.0

### 1. Clone & Install

```bash
git clone https://github.com/shiv9956/Sahaj.git
cd Sahaj
pnpm install

```

### 2. Environment Configuration

Create a `.env` file from the provided template:

```bash
cp .env.example .env

```

Ensure the following variables are configured in `.env`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/sahaj
REDIS_URL=redis://localhost:6379
SARVAM_API_KEY=your_sarvam_key
COGNEE_API_KEY=your_cognee_key

```

### 3. Run Test Suite

```bash
npx vitest run

```

### 4. Run Development Servers

```bash
# Terminal 1: Fastify Backend API (http://localhost:4000)
pnpm --filter @sahaj/api run dev

# Terminal 2: Next.js Frontend Client (http://localhost:3000)
pnpm --filter @sahaj/web run dev

```

---

## 📊 Evaluation & Verification

* **Intent Recognition:** 96.0% accuracy across a 60-scenario evaluation suite.
* **Grounding Gate:** 100% intercept rate on unverified synthetic claims or hallucinated rates.
* **Memory Boundary Isolation:** Zero cross-tenant leakage validated via HMAC dataset partitioning.
* **Security Posture:** 10/10 automated red-team prompt-injection and jailbreak vectors neutralized.
* For complete test cases and benchmarks, refer to [`docs/EVAL_REPORT.md`](https://www.google.com/search?q=docs/EVAL_REPORT.md).

---

## 🔌 Ecosystem Integration Seam

Sahaj includes a modular `FintechProductConnector` interface backed by a synthetic `MockPaytmAdapter` (`isSynthetic: true`) clearly flagged for testing. The adapter layer allows direct integration with production sandbox endpoints without requiring adjustments to the core journey orchestration or state machines.

---

## 👥 Authors & License

* **Team The NPM Tigers** — Built for the Paytm Hackathon (Track 2: AI-Powered Financial Journeys).
* Distributed under the [MIT License](https://www.google.com/search?q=LICENSE).
