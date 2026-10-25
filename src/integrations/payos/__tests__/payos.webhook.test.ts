import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

/**
 * Unit tests for PayOS Webhook HMAC Signature Verification Logic.
 *
 * PayOS uses HMAC SHA-256 to sign webhook payloads. The signing process:
 * 1. Sort the data object keys alphabetically
 * 2. Concatenate key=value pairs with '&'
 * 3. Generate HMAC SHA-256 with the CHECKSUM_KEY
 * 4. Compare the generated signature against the one in the webhook body
 *
 * These tests validate this verification flow independently from the PayOS SDK,
 * ensuring the underlying cryptographic logic is correct.
 */

// ─── Reference implementation of the HMAC signing used by PayOS ───

function sortObjByKey(obj: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    if (obj[key] !== null && obj[key] !== undefined) {
      sorted[key] = obj[key];
    }
  }
  return sorted;
}

function createSignatureString(data: Record<string, any>): string {
  const sorted = sortObjByKey(data);
  return Object.entries(sorted)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

function generateHMAC(data: Record<string, any>, checksumKey: string): string {
  const sigString = createSignatureString(data);
  return crypto
    .createHmac('sha256', checksumKey)
    .update(sigString)
    .digest('hex');
}

function verifyWebhookSignature(
  webhookBody: { data: Record<string, any>; signature: string },
  checksumKey: string
): boolean {
  const computedSignature = generateHMAC(webhookBody.data, checksumKey);
  return computedSignature === webhookBody.signature;
}

// ─── Test Suite ───

const TEST_CHECKSUM_KEY = 'abc123checksumkey456';

const VALID_WEBHOOK_DATA = {
  orderCode: 12345,
  amount: 500000,
  description: 'TDMU12345',
  accountNumber: '11330099',
  reference: 'FT20240101ABC',
  transactionDateTime: '2024-07-20 10:30:00',
  paymentLinkId: 'PLI_abcdef123',
  code: '00',
  desc: 'success',
};

describe('PayOS HMAC Webhook Signature — Signing', () => {
  it('should generate a deterministic HMAC-SHA256 signature', () => {
    const sig1 = generateHMAC(VALID_WEBHOOK_DATA, TEST_CHECKSUM_KEY);
    const sig2 = generateHMAC(VALID_WEBHOOK_DATA, TEST_CHECKSUM_KEY);

    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64); // SHA-256 hex digest is always 64 chars
  });

  it('should produce different signatures with different checksum keys', () => {
    const sig1 = generateHMAC(VALID_WEBHOOK_DATA, 'key_one');
    const sig2 = generateHMAC(VALID_WEBHOOK_DATA, 'key_two');

    expect(sig1).not.toBe(sig2);
  });

  it('should sort keys alphabetically before signing', () => {
    const unsorted = { z: 1, a: 2, m: 3 };
    const sigString = createSignatureString(unsorted);

    expect(sigString).toBe('a=2&m=3&z=1');
  });

  it('should exclude null/undefined values from signature string', () => {
    const data = { amount: 100, description: null, orderCode: 1 } as any;
    const sigString = createSignatureString(data);

    expect(sigString).toBe('amount=100&orderCode=1');
    expect(sigString).not.toContain('description');
  });
});

describe('PayOS HMAC Webhook Signature — Verification', () => {
  it('should verify a valid webhook signature', () => {
    const signature = generateHMAC(VALID_WEBHOOK_DATA, TEST_CHECKSUM_KEY);
    const webhookBody = {
      data: VALID_WEBHOOK_DATA,
      signature,
    };

    const isValid = verifyWebhookSignature(webhookBody, TEST_CHECKSUM_KEY);
    expect(isValid).toBe(true);
  });

  it('should reject a tampered webhook payload', () => {
    const signature = generateHMAC(VALID_WEBHOOK_DATA, TEST_CHECKSUM_KEY);

    // Attacker tampers the amount
    const tamperedData = { ...VALID_WEBHOOK_DATA, amount: 999999 };

    const isValid = verifyWebhookSignature({ data: tamperedData, signature }, TEST_CHECKSUM_KEY);
    expect(isValid).toBe(false);
  });

  it('should reject a forged signature', () => {
    const forgedSignature = 'a'.repeat(64);
    const webhookBody = {
      data: VALID_WEBHOOK_DATA,
      signature: forgedSignature,
    };

    const isValid = verifyWebhookSignature(webhookBody, TEST_CHECKSUM_KEY);
    expect(isValid).toBe(false);
  });

  it('should reject verification with wrong checksum key', () => {
    const correctSig = generateHMAC(VALID_WEBHOOK_DATA, TEST_CHECKSUM_KEY);
    const isValid = verifyWebhookSignature(
      { data: VALID_WEBHOOK_DATA, signature: correctSig },
      'wrong_checksum_key'
    );
    expect(isValid).toBe(false);
  });
});
