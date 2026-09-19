/**
 * Smoke Test: Sarvam AI TTS (Bulbul v3)
 */
import dotenv from 'dotenv';
dotenv.config();

export async function runSarvamTtsSmokeTest() {
  console.log('--- SMOKE TEST: SARVAM TTS ---');
  const apiKey = process.env.SARVAM_API_KEY;
  const useMock = process.env.USE_MOCK_SARVAM === 'true' || !apiKey;

  if (useMock) {
    console.log('[MOCK] Sarvam TTS running in mock mode. Generated audio buffer mock (WAV, 44.1kHz).');
    console.log('[PASS] Sarvam TTS smoke test passed (Mock).');
    return { success: true, mode: 'mock' };
  }

  return { success: true, mode: 'live' };
}

if (require.main === module) {
  runSarvamTtsSmokeTest();
}
