import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import { equal, issueSession, password, sessionSeconds, validSession } from '../utils/plannerAccess';

afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
describe('shared-password server access', () => {
  it('fails closed without configuration', () => {
    vi.stubEnv('NITRO_PLANNER_PASSWORD', '');
    expect(password()).toBe('');
  });
  it('reads the private server password', () => {
    vi.stubEnv('NITRO_PLANNER_PASSWORD', 'test-only-secret');
    expect(password()).toBe('test-only-secret');
  });
  it('compares exact passwords', () => {
    expect(equal('correct', 'correct')).toBe(true);
    expect(equal('correct', 'wrong')).toBe(false);
    expect(equal('correct', 'correct ')).toBe(false);
  });
  it('issues distinct expiring signed sessions', () => {
    const first = issueSession('test-only-secret');
    expect(first).not.toBe(issueSession('test-only-secret'));
    const [expires, nonce, signature] = first.split('.');
    expect(Number(expires)).toBeGreaterThan(Date.now());
    expect(nonce).toHaveLength(48);
    expect(signature).toHaveLength(64);
  });
  it('rejects malformed, tampered, expired and rotated-password sessions', () => {
    vi.useFakeTimers();
    const token = issueSession('test-only-secret');
    expect(validSession(token, 'test-only-secret')).toBe(true);
    expect(validSession(token, '')).toBe(false);
    expect(validSession(token, 'rotated-secret')).toBe(false);
    expect(validSession(`${token}.extra`, 'test-only-secret')).toBe(false);
    expect(validSession(token.replace(/^\d+/, 'NaN'), 'test-only-secret')).toBe(false);
    expect(validSession(token.slice(0, -1), 'test-only-secret')).toBe(false);
    vi.advanceTimersByTime(sessionSeconds * 1000);
    expect(validSession(token, 'test-only-secret')).toBe(false);
  });
  it('rejects signed sessions with invalid or excessive lifetimes', () => {
    for (const expiry of ['NaN', 'Infinity', String(Date.now() + sessionSeconds * 2000)]) {
      const payload = `${expiry}.${'a'.repeat(48)}`;
      const signature = createHmac('sha256', 'test-only-secret').update(payload).digest('hex');
      expect(validSession(`${payload}.${signature}`, 'test-only-secret')).toBe(false);
    }
  });
});
