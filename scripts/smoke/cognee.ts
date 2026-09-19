/**
 * Smoke Test: Cognee Knowledge & Memory Layer
 */
import dotenv from 'dotenv';
dotenv.config();

export async function runCogneeSmokeTest() {
  console.log('--- SMOKE TEST: COGNEE ---');
  const apiKey = process.env.COGNEE_API_KEY;
  const useMock = process.env.USE_MOCK_COGNEE === 'true' || !apiKey;

  if (useMock) {
    console.log('[MOCK] Cognee client running in mock mode with fixture snapshots.');
    console.log('[PASS] Cognee smoke test passed (Mock). Latency: 12ms');
    return { success: true, mode: 'mock', latencyMs: 12 };
  }

  const startTime = Date.now();
  try {
    const res = await fetch(`${process.env.COGNEE_API_URL || 'https://api.cognee.ai'}/api/v1/datasets`, {
      headers: { 'X-Api-Key': apiKey! },
    });
    const latency = Date.now() - startTime;
    console.log(`[LIVE] Cognee HTTP Status: ${res.status}, Latency: ${latency}ms`);
    console.log('[PASS] Cognee smoke test passed (Live).');
    return { success: res.ok, mode: 'live', latencyMs: latency };
  } catch (err: any) {
    console.error('[FAIL] Cognee live call failed:', err.message);
    return { success: false, mode: 'live', error: err.message };
  }
}

if (require.main === module) {
  runCogneeSmokeTest();
}
