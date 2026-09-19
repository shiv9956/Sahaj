# SAHAJ — PROJECT BRIEF (Track 2: Paytm Hackathon)

**Team:** The NPM Tigers  
**Track:** Paytm Hackathon — Track 2: AI-Powered Financial Journeys  
**One-Line Thesis:** *Clarity before credit.* The first barrier in Indian retail finance is not access, it is comprehension: jargon, language, fragmented steps, and fear of fine print. Sahaj is a deterministic journey engine (not a chatbot) that turns spoken/typed goals into guided, evidence-backed next actions across lending and insurance.

---

## Target Personas & Golden Journeys

1. **Priya (18, First-Gen Student)**
   - **Goal:** Wants ₹2,00,000 education loan for engineering admission.
   - **Language:** Hinglish (Roman/Devanagari). Phone-first.
   - **Journey:** Voice input → Amount chip confirmation → Profile completion → Moratorium loan comparison → Simulator sliders → Trust Receipt → Document OCR (admission letter) → Action checklist.

2. **Ramesh (46, Small Shop Owner & Co-Applicant)**
   - **Goal:** Co-applicant for son's loan; uncomfortable with financial English jargon.
   - **Language:** Hindi voice-first.
   - **Journey:** Voice query → Jargon Lens ("Moratorium kya hota hai?") → Plain Hindi analogy → Stress test simulator (-20% income test).

3. **Neha (27, Salaried IT Professional)**
   - **Goal:** Personal loan + family health protection.
   - **Language:** English.
   - **Journey:** Personal loan intent → Loan + Protection Bridge → Protection gap calculation → Life & Health insurance discovery → Deletable memory test.

---

## Key Wow Moments
1. **Voice → Amount Chip:** Hinglish STT parses spoken numbers ("do lakh"); shows explicit confirmation chip (`₹2,00,000, sahi hai?`) before updating profile.
2. **Trust Receipt:** Per-answer provenance drawer detailing graph nodes, queries, calculation assumptions, and effective dates.
3. **Regret-Proof Simulator & Forget Button:** Zero-latency browser sliders for EMI, total interest, effective cost IRR, and stress tests + "What Sahaj remembers" with one-click full data deletion.

---

## Feature Scope & Cut-Line Matrix (36–48h Target)

| Feature | Tier | Status | Description |
|---|---|---|---|
| **Trust Receipt** | A | Protected | Per-answer source & calculation provenance |
| **Bol-Kar-Samjho Voice** | A | Protected | Code-mixed Sarvam STT + Bulbul TTS + number chips |
| **Regret-Proof Simulator** | A | Protected | Browser/Server parity EMI & stress test engine |
| **Jargon Lens** | A | Protected | Tappable financial terms with EN/HI/Hinglish analogies |
| **Journey Memory Graph** | A | Protected | Cognee per-user isolated graph + Forget button |
| **Document Autopilot** | A | Protected | Sarvam Vision OCR for fee letters & salary slips |
| **Glass-Box Judge Mode** | A | Protected | Live pipeline execution traces (`?judge=1`) |
| **Zero-Dead-End NBA** | A | Protected | Deterministic Next Best Action on every turn |
| **Fine-Print Radar** | B | Included | Top 3 personalized watch-outs per product |
| **Loan + Protection Bridge** | B | Included | Lending to insurance transition bridge |
| **Living Knowledge Watchdog**| B | Included | Freshness badges & n8n incremental ingest |
| **Clarity Score & Chaos** | B | Included | Impact tracking & dependency failure simulator (`?chaos=1`) |
