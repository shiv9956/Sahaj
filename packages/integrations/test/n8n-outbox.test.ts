import { describe, it, expect } from 'vitest';
import { OutboxDispatcher } from '../src/n8n/outbox';

describe('Phase 8: n8n Transactional Outbox & HMAC Security Verification', () => {
  it('enqueues outbox events with idempotency keys and pending status', () => {
    const outbox = new OutboxDispatcher('test_secret');
    const event = outbox.enqueueEvent('document.uploaded', {
      document_id: 'doc_123',
      journey_id: 'j_456',
      doc_type: 'admission_letter',
    });

    expect(event.event_id).toBeDefined();
    expect(event.status).toBe('pending');
    expect(event.attempts).toBe(0);
    expect(event.idempotency_key).toContain('idempotency_');
  });

  it('generates and verifies valid HMAC-SHA256 signatures for n8n webhooks', () => {
    const secret = 'sahaj_demo_secret_key_2026';
    const outbox = new OutboxDispatcher(secret);
    const payload = { journey_id: 'j_priya_demo', reason: 'complex_case' };
    const timestamp = Date.now().toString();

    const signature = outbox.generateSahajSignature(payload, timestamp);
    expect(signature).toBeDefined();
    expect(signature.length).toBe(64); // SHA256 hex string

    const isValid = outbox.verifySahajSignature(payload, timestamp, signature);
    expect(isValid).toBe(true);
  });

  it('rejects replayed or expired signatures older than 5 minutes', () => {
    const secret = 'sahaj_demo_secret_key_2026';
    const outbox = new OutboxDispatcher(secret);
    const payload = { journey_id: 'j_priya_demo' };
    
    // 6 minutes ago timestamp (360,000 ms)
    const oldTimestamp = (Date.now() - 360000).toString();
    const signature = outbox.generateSahajSignature(payload, oldTimestamp);

    const isValid = outbox.verifySahajSignature(payload, oldTimestamp, signature);
    expect(isValid).toBe(false);
  });

  it('dispatches pending events and updates outbox status', async () => {
    const outbox = new OutboxDispatcher();
    outbox.enqueueEvent('journey.documents_pending', { journey_id: 'j_test' });
    outbox.enqueueEvent('escalation.requested', { journey_id: 'j_test', reason: 'clarification' });

    const initialEvents = outbox.listEvents();
    expect(initialEvents.length).toBe(2);
    expect(initialEvents[0].status).toBe('pending');

    const result = await outbox.dispatchPendingEvents();
    expect(result.dispatched).toBe(2);
    expect(result.failed).toBe(0);

    const updatedEvents = outbox.listEvents();
    expect(updatedEvents[0].status).toBe('sent');
    expect(updatedEvents[1].status).toBe('sent');
  });
});
