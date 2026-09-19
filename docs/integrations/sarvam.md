# SARVAM AI INTEGRATION RECONNAISSANCE (`docs/integrations/sarvam.md`)

## Overview
Sarvam AI powers Indic voice intelligence, code-mixed speech recognition, Indic speech synthesis, Hinglish LLM composition, and document vision OCR.

## API Endpoints & Headers
- Base URL: `https://api.sarvam.ai`
- Auth Header: `api-subscription-key: <key>`

## Services & Models
1. **Speech-to-Text (STT):** Saaras v3 (`POST /speech-to-text`) in code-mixed mode. Parses "do lakh", "dedh lakh", "dhai lakh" into numeric confirmation chips.
2. **Text-to-Speech (TTS):** Bulbul v3 (`POST /text-to-speech`) with voice & pace parameters for Hindi/Hinglish speech output.
3. **Translation / Transliteration:** Mayura / Sarvam-Translate for English <-> Hindi <-> Hinglish conversions while maintaining protected terms (EMI, moratorium, co-applicant).
4. **Document Intelligence (Vision):** Sarvam Vision (`POST /document-digitization`) for OCR extraction on fee letters and salary slips.
5. **Chat LLM:** Sarvam-30B (fast extraction) / Sarvam-105B (flagship reasoning).
