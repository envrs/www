import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as webhookSecurity from '../lib/webhook-security';
import * as validation from '../lib/validation';
import { AuthenticationError, ValidationError } from '../lib/errors';

describe('Webhook Security', () => {
  const secret = 'test-secret-at-least-12-chars';

  it('should validate GitHub webhook signatures', () => {
    const payload = 'test payload';
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const signature = `sha256=${hash}`;

    expect(() =>
      webhookSecurity.verifyGitHubWebhookSignature(payload, signature, secret)
    ).not.toThrow();
  });

  it('should reject missing signatures', () => {
    expect(() =>
      webhookSecurity.verifyGitHubWebhookSignature('payload', undefined, secret)
    ).toThrow(AuthenticationError);
  });

  it('should reject invalid signature format', () => {
    expect(() =>
      webhookSecurity.verifyGitHubWebhookSignature('payload', 'invalid', secret)
    ).toThrow(AuthenticationError);
  });

  it('should extract webhook signatures from headers', () => {
    const signature = 'sha256=abc123';
    const headers = {
      'x-hub-signature-256': signature,
    };

    const extracted = webhookSecurity.extractWebhookSignature(headers);
    expect(extracted).toBe(signature);
  });

  it('should validate webhook secrets', () => {
    expect(() => webhookSecurity.validateWebhookSecret('short')).toThrow();
    expect(() =>
      webhookSecurity.validateWebhookSecret('valid-secret-at-least-12-chars')
    ).not.toThrow();
  });
});

describe('GitHub Webhook Payload Validation', () => {
  it('should accept valid PR opened event', () => {
    const payload = {
      action: 'opened',
      pull_request: {
        id: 1,
        number: 1,
        title: 'Add new feature',
      },
      repository: {
        name: 'test-repo',
        full_name: 'org/test-repo',
        owner: { login: 'org' },
      },
    };

    expect(() => validation.validateGitHubPayload(payload)).not.toThrow();
  });

  it('should accept synchronize events', () => {
    const payload = {
      action: 'synchronize',
      pull_request: {
        id: 1,
        number: 1,
        title: 'Add new feature',
      },
      repository: {
        name: 'test-repo',
        full_name: 'org/test-repo',
        owner: { login: 'org' },
      },
    };

    expect(() => validation.validateGitHubPayload(payload)).not.toThrow();
  });

  it('should reject invalid actions', () => {
    const payload = {
      action: 'invalid_action',
      pull_request: { id: 1, number: 1, title: 'Test' },
      repository: {
        name: 'test-repo',
        full_name: 'org/test-repo',
        owner: { login: 'org' },
      },
    };

    expect(() => validation.validateGitHubPayload(payload)).toThrow(ValidationError);
  });

  it('should reject missing pull_request', () => {
    const payload = {
      action: 'opened',
      repository: {
        name: 'test-repo',
        full_name: 'org/test-repo',
        owner: { login: 'org' },
      },
    };

    expect(() => validation.validateGitHubPayload(payload as any)).toThrow();
  });

  it('should reject missing repository', () => {
    const payload = {
      action: 'opened',
      pull_request: { id: 1, number: 1, title: 'Test' },
    };

    expect(() => validation.validateGitHubPayload(payload as any)).toThrow();
  });
});

describe('Input Sanitization', () => {
  it('should sanitize dangerous input', () => {
    const dirty = '<script>alert("xss")</script>';
    const clean = validation.sanitizeInput(dirty);

    expect(clean).not.toContain('<');
    expect(clean).not.toContain('>');
  });

  it('should trim whitespace', () => {
    const input = '  test  ';
    const sanitized = validation.sanitizeInput(input);

    expect(sanitized).toBe('test');
  });

  it('should limit input size', () => {
    const longInput = 'a'.repeat(20000);
    const sanitized = validation.sanitizeInput(longInput);

    expect(sanitized.length).toBeLessThanOrEqual(10000);
  });
});
