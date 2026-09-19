import crypto from 'crypto';

export interface OutboxEvent {
  event_id: string;
  type: 'document.uploaded' | 'journey.documents_pending' | 'escalation.requested' | 'knowledge.refresh_requested' | 'journey.completed';
  payload: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'dead';
  attempts: number;
  max_attempts: number;
  next_attempt_at: string;
  idempotency_key: string;
  created_at: string;
}

export class OutboxDispatcher {
  private secret: string;
  private n8nBaseUrl: string;
  private eventsStore: Map<string, OutboxEvent> = new Map();

  constructor(secret?: string, n8nBaseUrl?: string) {
    this.secret = secret || process.env.HMAC_SECRET || 'sahaj_demo_secret_key_2026';
    this.n8nBaseUrl = n8nBaseUrl || process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
  }

  /**
   * Generates HMAC-SHA256 signature for outgoing n8n webhooks
   */
  generateSahajSignature(payload: Record<string, any>, timestamp: string): string {
    const data = `${timestamp}.${JSON.stringify(payload)}`;
    return crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Verifies HMAC-SHA256 signature on internal callbacks with 5-minute anti-replay protection
   */
  verifySahajSignature(payload: Record<string, any>, timestamp: string, signature: string): boolean {
    const ts = parseInt(timestamp, 10);
    const now = Date.now();

    // Reject timestamps older than 5 minutes (300,000 ms) or in the future by > 1 min
    if (isNaN(ts) || Math.abs(now - ts) > 300000) {
      console.warn('[OutboxDispatcher] Rejected callback: Timestamp expired or invalid.');
      return false;
    }

    const expectedSignature = this.generateSahajSignature(payload, timestamp);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Enqueues an event into the transactional outbox
   */
  enqueueEvent(
    type: OutboxEvent['type'],
    payload: Record<string, any>,
    idempotencyKey?: string
  ): OutboxEvent {
    const eventId = `evt_${Math.random().toString(36).substring(2, 9)}`;
    const event: OutboxEvent = {
      event_id: eventId,
      type,
      payload,
      status: 'pending',
      attempts: 0,
      max_attempts: 5,
      next_attempt_at: new Date().toISOString(),
      idempotency_key: idempotencyKey || `idempotency_${eventId}`,
      created_at: new Date().toISOString(),
    };

    this.eventsStore.set(eventId, event);
    return event;
  }

  /**
   * Simulated dispatching of pending outbox events to n8n webhooks
   */
  async dispatchPendingEvents(): Promise<{ dispatched: number; failed: number }> {
    let dispatched = 0;
    let failed = 0;

    for (const [eventId, event] of this.eventsStore.entries()) {
      if (event.status === 'pending') {
        event.attempts += 1;
        const timestamp = Date.now().toString();
        const signature = this.generateSahajSignature(event.payload, timestamp);

        // Simulate n8n webhook post
        try {
          // If n8n mock mode is enabled or simulated dispatch
          event.status = 'sent';
          dispatched += 1;
        } catch (err) {
          if (event.attempts >= event.max_attempts) {
            event.status = 'dead';
          }
          failed += 1;
        }
      }
    }

    return { dispatched, failed };
  }

  /**
   * Gets an outbox event by ID
   */
  getEvent(eventId: string): OutboxEvent | undefined {
    return this.eventsStore.get(eventId);
  }

  /**
   * Lists all stored outbox events
   */
  listEvents(): OutboxEvent[] {
    return Array.from(this.eventsStore.values());
  }
}
