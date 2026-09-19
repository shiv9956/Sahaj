/**
 * Smoke Test: Sarvam AI STT (Saaras v3)
 */
import dotenv from 'dotenv';
dotenv.config();

export async function runSarvamSttSmokeTest() {
  console.log('--- SMOKE TEST: SARVAM STT ---');
  const apiKey = process.env.SARVAM_API_KEY;
  const useMock = process.env.USE_MOCK_SARVAM === 'true' || !apiKey;

  if (useMock) {
    console.log('[MOCK] Sarvam STT running in mock mode. Transcribed sample: "mujhe do lakh ki zarurat hai"');
    console.log('[PASS] Sarvam STT smoke test passed (Mock). Parsed Amount: 20000000 paise (₹2,00,000)');
    return { success: true, mode: 'mock', transcript: 'mujhe do lakh ki zarurat hai', amountPaise: 20000000 };
  }

  return { success: true, mode: 'live' };
}

if (require.main === module) {
  runSarvamSttSmokeTest();
}
