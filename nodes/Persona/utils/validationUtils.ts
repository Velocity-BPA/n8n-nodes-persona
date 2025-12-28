/**
 * Persona Validation Utilities
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

import { NodeOperationError } from 'n8n-workflow';

/**
 * Persona ID prefixes for different resource types
 */
export const ID_PREFIXES = {
  INQUIRY: 'inq_',
  ACCOUNT: 'act_',
  VERIFICATION: 'ver_',
  DOCUMENT: 'doc_',
  SELFIE: 'sel_',
  GOVERNMENT_ID: 'gid_',
  REPORT: 'rep_',
  CASE: 'cas_',
  TRANSACTION: 'txn_',
  EVENT: 'evt_',
  WEBHOOK: 'wbh_',
  LIST: 'lst_',
  LIST_ITEM: 'lit_',
  TEMPLATE: 'itmpl_',
  WORKFLOW: 'wfl_',
  SESSION: 'ses_',
  THEME: 'the_',
  WATCHLIST_HIT: 'wlh_',
  DATABASE_VERIFICATION: 'ver_',
} as const;

/**
 * Validate a Persona ID format
 */
export function validatePersonaId(
  id: string,
  expectedPrefix?: string,
  nodeName?: string,
): void {
  if (!id) {
    throw new NodeOperationError(
      { name: nodeName || 'Persona' } as any,
      'ID is required',
    );
  }

  if (expectedPrefix && !id.startsWith(expectedPrefix)) {
    throw new NodeOperationError(
      { name: nodeName || 'Persona' } as any,
      `Invalid ID format. Expected ID to start with "${expectedPrefix}", got "${id}"`,
    );
  }
}

/**
 * Validate a reference ID (external ID provided by the user)
 */
export function validateReferenceId(referenceId: string, nodeName?: string): void {
  if (!referenceId) {
    throw new NodeOperationError(
      { name: nodeName || 'Persona' } as any,
      'Reference ID is required',
    );
  }

  // Reference IDs should be alphanumeric with dashes and underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(referenceId)) {
    throw new NodeOperationError(
      { name: nodeName || 'Persona' } as any,
      'Reference ID can only contain letters, numbers, dashes, and underscores',
    );
  }

  // Max length check
  if (referenceId.length > 255) {
    throw new NodeOperationError(
      { name: nodeName || 'Persona' } as any,
      'Reference ID cannot exceed 255 characters',
    );
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string, nodeName?: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new NodeOperationError(
      { name: nodeName || 'Persona' } as any,
      `Invalid email format: ${email}`,
    );
  }
}

/**
 * Validate phone number format (E.164)
 */
export function validatePhoneNumber(phone: string, nodeName?: string): void {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    throw new NodeOperationError(
      { name: nodeName || 'Persona' } as any,
      `Invalid phone number format. Expected E.164 format (e.g., +14155551234), got: ${phone}`,
    );
  }
}

/**
 * Validate date format (ISO 8601)
 */
export function validateDate(date: string, nodeName?: string): void {
  const parsed = Date.parse(date);
  if (isNaN(parsed)) {
    throw new NodeOperationError(
      { name: nodeName || 'Persona' } as any,
      `Invalid date format: ${date}. Expected ISO 8601 format.`,
    );
  }
}

/**
 * Validate country code (ISO 3166-1 alpha-2)
 */
export function validateCountryCode(code: string, nodeName?: string): void {
  if (!/^[A-Z]{2}$/.test(code)) {
    throw new NodeOperationError(
      { name: nodeName || 'Persona' } as any,
      `Invalid country code: ${code}. Expected ISO 3166-1 alpha-2 format (e.g., US, CA, GB).`,
    );
  }
}

/**
 * Generate a unique idempotency key
 */
export function generateIdempotencyKey(): string {
  return `idem_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Sanitize string for safe logging (remove sensitive data)
 */
export function sanitizeForLogging(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    'apiKey',
    'apiKeySecret',
    'webhookSecret',
    'ssn',
    'socialSecurityNumber',
    'password',
    'secret',
    'token',
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
