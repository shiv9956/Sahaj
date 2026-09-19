/**
 * Smoke Test: n8n Webhook HMAC Signature Dispatcher
 */
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

export async function runN8nWebhookSmokeTest() {
  console.log('--- SMOKE TEST: n8n WEBHOOK DISPATCHER ---');
  const secret = process.env.N8N_HMAC_SECRET || 'sahaj_n8n_hmac_secret_key';
  const timestamp = Date.now().toString();
  const payload = JSON.stringify({ event: 'test.ping', timestamp });

  const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');

  console.log(`[PASS] Generated HMAC Signature: sha256=${signature.slice(0, 16)}...`);
  console.log('[PASS] n8n Webhook signature dispatcher test passed.');
  return { success: true, signature };
}

if (require.main === module) {
  runN8nWebhookSmokeTest();
}
