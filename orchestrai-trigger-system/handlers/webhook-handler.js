/**
 * Generic Webhook Handler
 *
 * Handles generic webhooks from external services
 */

class WebhookHandler {
  constructor(options = {}) {
    this.config = {
      validateHeaders: options.validateHeaders !== false,
      ...options
    };
  }

  /**
   * Handle webhook event
   */
  async handleEvent(payload, headers = {}, query = {}) {
    // Extract webhook ID from path or query
    const webhookId = query.id || headers['x-webhook-id'];

    // Create normalized event
    const event = {
      type: 'webhook',
      event: `webhook.${webhookId || 'generic'}`,
      data: {
        webhookId,
        payload,
        query
      },
      metadata: {
        receivedAt: new Date().toISOString(),
        headers: this.sanitizeHeaders(headers),
        sourceIp: headers['x-forwarded-for'] || headers['x-real-ip']
      },
      raw: payload
    };

    return event;
  }

  /**
   * Sanitize headers (remove sensitive data)
   */
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };

    // Remove authorization headers
    delete sanitized.authorization;
    delete sanitized['x-api-key'];
    delete sanitized.cookie;

    return sanitized;
  }

  /**
   * Verify webhook signature (if configured)
   */
  verifySignature(payload, signature, secret, algorithm = 'sha256') {
    if (!signature || !secret) {
      return false;
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac(algorithm, secret);
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = hmac.update(payloadString).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

module.exports = WebhookHandler;
