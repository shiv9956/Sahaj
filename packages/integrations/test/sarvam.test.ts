import { describe, it, expect } from 'vitest';
import { SarvamClient } from '../src/sarvam/index';

describe('Phase 5: Sarvam AI Integration (Speech, Voice & Document Vision OCR)', () => {
  const sarvam = new SarvamClient({ useMock: true });

  it('transcribes Hinglish audio and extracts amount confirmation chips (S2 Bol-Kar-Samjho)', async () => {
    const audioBuffer = Buffer.from('mock_hinglish_audio_bytes');
    const result = await sarvam.transcribeAudio(audioBuffer, 'hi-IN');

    expect(result.transcript).toBeDefined();
    expect(result.detectedLanguage).toBe('hi-Latn');
    expect(result.confirmationChips.length).toBeGreaterThan(0);
    
    const chip = result.confirmationChips[0];
    expect(chip.field).toBe('amount_paise');
    expect(chip.value).toBe(20000000);
    expect(chip.chipLabel).toContain('sahi hai?');
  });

  it('synthesizes speech with numeral verbalization in Bulbul v3 TTS', async () => {
    const text = 'Aapka estimated EMI ₹2,00,000 ke loan par ₹4,249/month hoga';
    const audioBuffer = await sarvam.synthesizeSpeech(text, 'hi-IN');

    expect(audioBuffer).toBeDefined();
    expect(audioBuffer.length).toBeGreaterThan(0);
    expect(audioBuffer.toString()).toContain('2 lakh rupees');
  });

  it('digitizes admission fee structure documents with schema extraction & PII masking (S6)', async () => {
    const pdfBuffer = Buffer.from('mock_pdf_bytes');
    const result = await sarvam.digitizeDocument(pdfBuffer, 'admission_letter');

    expect(result.docType).toBe('admission_letter');
    expect(result.piiMasked).toBe(true);
    expect(result.extractedFields.institution.value).toBe('IIT Delhi');
    expect(result.extractedFields.annual_fee_paise.value).toBe(20000000);
  });

  it('digitizes salary slips with gross/net income extraction', async () => {
    const pdfBuffer = Buffer.from('mock_pdf_bytes');
    const result = await sarvam.digitizeDocument(pdfBuffer, 'salary_slip');

    expect(result.docType).toBe('salary_slip');
    expect(result.extractedFields.gross_monthly_income_paise.value).toBe(6500000);
    expect(result.extractedFields.net_monthly_income_paise.value).toBe(5800000);
  });

  it('translates text while preserving protected financial terminology', async () => {
    const input = 'Your loan includes an EMI payment and a 12-month Moratorium period.';
    const translated = await sarvam.translateText(input, 'hi');

    expect(translated).toContain('EMI');
    expect(translated).toContain('Moratorium');
  });
});
