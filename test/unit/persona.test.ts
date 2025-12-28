/**
 * Persona Node Unit Tests
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

import {
  verifyWebhookSignature,
  computeSignature,
  parseSignatureHeader,
  generateTestSignature,
} from '../nodes/Persona/utils/signatureUtils';

import {
  validatePersonaId,
  validateReferenceId,
  validateEmail,
  validatePhoneNumber,
  validateCountryCode,
  generateIdempotencyKey,
  ID_PREFIXES,
} from '../nodes/Persona/utils/validationUtils';

import {
  buildPaginationParams,
  extractCursorFromLink,
} from '../nodes/Persona/utils/paginationUtils';

describe('Signature Utils', () => {
  const testSecret = 'test_webhook_secret_key';
  const testPayload = '{"data":{"type":"inquiry.created","id":"inq_123"}}';

  describe('parseSignatureHeader', () => {
    it('should parse valid signature header', () => {
      const header = 't=1234567890,v1=abcdef123456';
      const result = parseSignatureHeader(header);
      expect(result).toEqual({
        timestamp: '1234567890',
        signature: 'abcdef123456',
      });
    });

    it('should return null for invalid header', () => {
      expect(parseSignatureHeader('invalid')).toBeNull();
      expect(parseSignatureHeader('')).toBeNull();
    });
  });

  describe('computeSignature', () => {
    it('should compute consistent signatures', () => {
      const timestamp = '1234567890';
      const sig1 = computeSignature(timestamp, testPayload, testSecret);
      const sig2 = computeSignature(timestamp, testPayload, testSecret);
      expect(sig1).toBe(sig2);
    });

    it('should produce different signatures for different payloads', () => {
      const timestamp = '1234567890';
      const sig1 = computeSignature(timestamp, testPayload, testSecret);
      const sig2 = computeSignature(timestamp, 'different payload', testSecret);
      expect(sig1).not.toBe(sig2);
    });
  });

  describe('generateTestSignature', () => {
    it('should generate valid signature format', () => {
      const signature = generateTestSignature(testPayload, testSecret);
      expect(signature).toMatch(/^t=\d+,v1=[a-f0-9]+$/);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid signature', () => {
      const signature = generateTestSignature(testPayload, testSecret);
      const result = verifyWebhookSignature(signature, testPayload, testSecret, 600);
      expect(result).toBe(true);
    });

    it('should reject invalid signature', () => {
      const signature = 't=1234567890,v1=invalidsignature';
      const result = verifyWebhookSignature(signature, testPayload, testSecret);
      expect(result).toBe(false);
    });
  });
});

describe('Validation Utils', () => {
  describe('validatePersonaId', () => {
    it('should accept valid inquiry ID', () => {
      expect(() => validatePersonaId('inq_abc123', ID_PREFIXES.INQUIRY)).not.toThrow();
    });

    it('should reject invalid prefix', () => {
      expect(() => validatePersonaId('act_123', ID_PREFIXES.INQUIRY)).toThrow();
    });

    it('should reject empty ID', () => {
      expect(() => validatePersonaId('')).toThrow();
    });
  });

  describe('validateReferenceId', () => {
    it('should accept valid reference ID', () => {
      expect(() => validateReferenceId('user_12345')).not.toThrow();
      expect(() => validateReferenceId('abc-123-def')).not.toThrow();
    });

    it('should reject invalid characters', () => {
      expect(() => validateReferenceId('user@123')).toThrow();
      expect(() => validateReferenceId('user 123')).toThrow();
    });

    it('should reject empty reference ID', () => {
      expect(() => validateReferenceId('')).toThrow();
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email', () => {
      expect(() => validateEmail('test@example.com')).not.toThrow();
    });

    it('should reject invalid email', () => {
      expect(() => validateEmail('invalid')).toThrow();
      expect(() => validateEmail('test@')).toThrow();
    });
  });

  describe('validatePhoneNumber', () => {
    it('should accept valid E.164 phone numbers', () => {
      expect(() => validatePhoneNumber('+14155551234')).not.toThrow();
      expect(() => validatePhoneNumber('+442071234567')).not.toThrow();
    });

    it('should reject invalid phone numbers', () => {
      expect(() => validatePhoneNumber('4155551234')).toThrow();
      expect(() => validatePhoneNumber('+1-415-555-1234')).toThrow();
    });
  });

  describe('validateCountryCode', () => {
    it('should accept valid country codes', () => {
      expect(() => validateCountryCode('US')).not.toThrow();
      expect(() => validateCountryCode('GB')).not.toThrow();
    });

    it('should reject invalid country codes', () => {
      expect(() => validateCountryCode('USA')).toThrow();
      expect(() => validateCountryCode('us')).toThrow();
    });
  });

  describe('generateIdempotencyKey', () => {
    it('should generate unique keys', () => {
      const key1 = generateIdempotencyKey();
      const key2 = generateIdempotencyKey();
      expect(key1).not.toBe(key2);
    });

    it('should have correct prefix', () => {
      const key = generateIdempotencyKey();
      expect(key).toMatch(/^idem_/);
    });
  });
});

describe('Pagination Utils', () => {
  describe('buildPaginationParams', () => {
    it('should build params with page size', () => {
      const params = buildPaginationParams({ pageSize: 50 });
      expect(params).toEqual({ 'page[size]': 50 });
    });

    it('should build params with cursor', () => {
      const params = buildPaginationParams({ pageAfter: 'cursor123' });
      expect(params).toEqual({ 'page[after]': 'cursor123' });
    });

    it('should handle empty params', () => {
      const params = buildPaginationParams({});
      expect(params).toEqual({});
    });
  });

  describe('extractCursorFromLink', () => {
    it('should extract cursor from URL', () => {
      const link = 'https://withpersona.com/api/v1/inquiries?page[after]=cursor123';
      const cursor = extractCursorFromLink(link);
      expect(cursor).toBe('cursor123');
    });

    it('should return null for invalid URL', () => {
      const cursor = extractCursorFromLink('invalid');
      expect(cursor).toBeNull();
    });
  });
});
