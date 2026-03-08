import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecurityAnalyzer } from '../lib/analyzers/security';
import { QualityAnalyzer } from '../lib/analyzers/quality';
import * as validation from '../lib/validation';
import * as errors from '../lib/errors';

describe('SecurityAnalyzer', () => {
  let analyzer: SecurityAnalyzer;

  beforeEach(() => {
    analyzer = new SecurityAnalyzer();
  });

  it('should identify SQL injection vulnerabilities', async () => {
    const vulnerableCode = `
      const query = "SELECT * FROM users WHERE id = " + userId;
      db.execute(query);
    `;

    const result = await analyzer.analyze(vulnerableCode, {
      orgId: 'test-org',
      repoId: 'test-repo',
      prId: 'test-pr',
    });

    expect(result.type).toBe('security');
    expect(result.metadata.provider).toBe('anthropic');
    expect(result.metadata.model).toContain('claude');
  });

  it('should have required fields in response', async () => {
    const code = 'function test() { return true; }';

    const result = await analyzer.analyze(code, {
      orgId: 'test-org',
      repoId: 'test-repo',
      prId: 'test-pr',
    });

    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('findings');
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toHaveProperty('duration');
    expect(result.metadata).toHaveProperty('model');
    expect(result.metadata).toHaveProperty('provider');
  });
});

describe('QualityAnalyzer', () => {
  let analyzer: QualityAnalyzer;

  beforeEach(() => {
    analyzer = new QualityAnalyzer();
  });

  it('should detect code quality issues', async () => {
    const poorCode = `
      function processData(d) {
        let x = 0;
        for (let i = 0; i < d.length; i++) {
          for (let j = 0; j < d.length; j++) {
            x = x + d[i] * d[j];
          }
        }
        return x;
      }
    `;

    const result = await analyzer.analyze(poorCode, {
      orgId: 'test-org',
      repoId: 'test-repo',
      prId: 'test-pr',
    });

    expect(result.type).toBe('code-quality');
    expect(result.summary).toBeDefined();
    expect(Array.isArray(result.findings)).toBe(true);
  });
});

describe('Validation', () => {
  it('should validate GitHub webhook payloads', () => {
    const validPayload = {
      action: 'opened',
      pull_request: {
        id: 1,
        number: 1,
        title: 'Test PR',
      },
      repository: {
        name: 'test',
        full_name: 'org/test',
        owner: { login: 'org' },
      },
    };

    expect(() => validation.validateGitHubPayload(validPayload)).not.toThrow();
  });

  it('should reject invalid GitHub webhook payloads', () => {
    const invalidPayload = {
      action: 'invalid_action',
    };

    expect(() => validation.validateGitHubPayload(invalidPayload as any)).toThrow(
      validation.ValidationError
    );
  });

  it('should validate email addresses', () => {
    expect(validation.validateEmail('test@example.com')).toBe(true);
    expect(validation.validateEmail('invalid-email')).toBe(false);
  });

  it('should validate UUIDs', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    const invalidUUID = 'not-a-uuid';

    expect(validation.validateUUID(validUUID)).toBe(true);
    expect(validation.validateUUID(invalidUUID)).toBe(false);
  });

  it('should validate repository names', () => {
    expect(validation.validateRepositoryName('my-repo')).toBe(true);
    expect(validation.validateRepositoryName('my_repo')).toBe(true);
    expect(validation.validateRepositoryName('invalid repo')).toBe(false);
  });
});

describe('Error Handling', () => {
  it('should create validation errors', () => {
    const error = new errors.ValidationError('Test error', { field: 'value' });
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: 'value' });
  });

  it('should create authentication errors', () => {
    const error = new errors.AuthenticationError('Invalid token');
    expect(error.code).toBe('AUTH_ERROR');
    expect(error.statusCode).toBe(401);
  });

  it('should create authorization errors', () => {
    const error = new errors.AuthorizationError('No access');
    expect(error.code).toBe('AUTHZ_ERROR');
    expect(error.statusCode).toBe(403);
  });

  it('should identify app errors', () => {
    const appError = new errors.ValidationError('Test');
    const regularError = new Error('Regular error');

    expect(errors.isAppError(appError)).toBe(true);
    expect(errors.isAppError(regularError)).toBe(false);
  });

  it('should format error responses', () => {
    const appError = new errors.ValidationError('Test error', { field: 'test' });
    const formatted = errors.formatErrorResponse(appError);

    expect(formatted).toHaveProperty('code');
    expect(formatted).toHaveProperty('message');
    expect(formatted).toHaveProperty('statusCode');
    expect(formatted.statusCode).toBe(400);
  });
});
