/**
 * Persona Signature Utilities
 *
 * [Velocity BPA Licensing Notice]
 *
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 *
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from Velocity BPA.
 *
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import * as crypto from 'crypto';

export interface SignatureComponents {
  timestamp: string;
  signature: string;
}

/**
 * Parse the Persona-Signature header
 * Format: t=<timestamp>,v1=<signature>
 */
export function parseSignatureHeader(header: string): SignatureComponents | null {
  const parts = header.split(',');
  let timestamp = '';
  let signature = '';

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') {
      timestamp = value;
    } else if (key === 'v1') {
      signature = value;
    }
  }

  if (!timestamp || !signature) {
    return null;
  }

  return { timestamp, signature };
}

/**
 * Compute the expected signature for a webhook payload
 */
export function computeSignature(
  timestamp: string,
  payload: string,
  secret: string,
): string {
  const signedPayload = `${timestamp}.${payload}`;
  return crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
}

/**
 * Verify a Persona webhook signature
 */
export function verifyWebhookSignature(
  signatureHeader: string,
  payload: string,
  secret: string,
  toleranceSeconds = 300,
): boolean {
  const components = parseSignatureHeader(signatureHeader);
  if (!components) {
    return false;
  }

  const { timestamp, signature } = components;

  // Check timestamp tolerance
  const timestampMs = parseInt(timestamp, 10) * 1000;
  const now = Date.now();
  if (Math.abs(now - timestampMs) > toleranceSeconds * 1000) {
    return false;
  }

  // Compute and compare signatures
  const expectedSignature = computeSignature(timestamp, payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex'),
  );
}

/**
 * Generate a signature for testing purposes
 */
export function generateTestSignature(
  payload: string,
  secret: string,
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = computeSignature(timestamp, payload, secret);
  return `t=${timestamp},v1=${signature}`;
}
