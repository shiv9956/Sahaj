# SAHAJ — 3-MINUTE GOLDEN PATH LIVE DEMO SCRIPT

**Hackathon:** Paytm Hackathon — Track 2: AI-Powered Financial Journeys  
**Team:** The NPM Tigers  
**Target Duration:** Exactly 3 minutes (03:00)  

---

## Beat-by-Beat Presentation & Demo Timeline

| Timestamp | Screen / Visual | Speaker Script | Sponsor Proof Point |
|---|---|---|---|
| **0:00–0:20** | Welcome & Language Picker | "Judges, the first barrier in Indian retail finance isn't access—it's comprehension: jargon, fear of fine print, and fragmented steps. Meet Sahaj: a journey engine, not a chatbot, built on *clarity before credit*." | Welcome Consent & DPDP Privacy Toggle |
| **0:20–0:50** | Hinglish Voice Input & **Amount Confirmation Chip** | Priya (18) speaks Hinglish: *"Mujhe ₹2 lakh ki zarurat hai education ke liye"*. Sahaj transcribes and surfaces a safety confirmation chip: *"₹2,00,000, sahi hai?"*. Priya confirms. | **Sarvam AI STT (Saaras v3)** (Judge Mode row) |
| **0:50–1:15** | Journey Stepper & One Question Planner | Sahaj advances the 5-step Journey Rail (*Goal -> Profile -> Compare -> Docs -> Action*) and asks **one** purposeful question about monthly income, keeping cognitive load near zero. | State Machine Reducer & Planner |
| **1:15–1:50** | **Regret-Proof Simulator** & **Jargon Lens** | Priya drags sliders for amount, tenure, and 12-month moratorium. EMI, total interest, and DTI stress test update instantly with 0ms calculation parity. Priya taps *"Moratorium"* to open the Jargon Lens popover with an everyday analogy. | **Pure-TS Engine** & **Cognee Glossary** |
| **1:50–2:15** | **Trust Receipt Drawer** | Priya taps *"Show Source"*. The Trust Receipt drawer opens instantly, showing the exact Cognee dataset, document version (`v1.0`), RBI moratorium guidelines, and calculation assumptions. "No number without a receipt." | **Cognee Graph Provenance (S1)** |
| **2:15–2:40** | **Document Autopilot** & n8n Nudge | Upload synthetic admission letter -> Sarvam Vision extracts institution, course, and fee -> Priya reviews extracted fields and confirms -> n8n outbox dispatches document checklist nudge. | **Sarvam Vision OCR** & **n8n WF-1 / WF-2** |
| **2:40–2:55** | **What Sahaj Remembers** & **Forget Button** | Priya opens the Memory panel, showing remembered facts stored in Cognee. Tapping **"Forget All"** instantly purges user dataset from Cognee and local Mongo under DPDP principles. | **Cognee User Memory (S5)** & HMAC Isolation |
| **2:55–3:00** | Next Best Action & Paytm Seam | Sticky bottom rail displays next action (*Proceed to Doc Check*). "Our abstract product connector is mock today, ready to swap in real Paytm APIs tomorrow." | **Fintech Product Connector Seam** |

---

## Emergency Backup & Chaos Demo Variant (5 Minutes)

If judges request a deep dive into resilience:
1. Turn on **Chaos Toggle (S13)**.
2. Observe Cognee & Sarvam outage banner.
3. Show that chat continues gracefully using recorded snapshot context fixtures without blocking the user.
