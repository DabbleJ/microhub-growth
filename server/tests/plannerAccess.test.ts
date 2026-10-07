import { afterEach, describe, expect, it, vi } from 'vitest';
import { equal, issueSession, password } from '../utils/plannerAccess';

afterEach(() => vi.unstubAllEnvs());
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
});
