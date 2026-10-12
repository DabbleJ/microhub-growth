import { createHash, createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { createError, getCookie, getRequestURL, type H3Event } from 'nitro/h3';

export const cookieName = 'bline_access';
export const sessionSeconds = 8 * 60 * 60;
export function password() {
  return process.env.NITRO_PLANNER_PASSWORD || '';
}
export function equal(a: string, b: string) {
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}
export function issueSession(secret: string) {
  const payload = `${Date.now() + sessionSeconds * 1000}.${randomBytes(24).toString('hex')}`;
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('hex')}`;
}
export function validSession(token: string, secret: string) {
  if (!secret || !/^\d{13}\.[a-f0-9]{48}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expires, nonce, signature] = token.split('.');
  const expiry = Number(expires);
  if (!Number.isSafeInteger(expiry) || expiry <= Date.now() || expiry > Date.now() + sessionSeconds * 1000) return false;
  const expected = createHmac('sha256', secret).update(`${expires}.${nonce}`).digest('hex');
  return equal(signature, expected);
}
export function hasSession(event: H3Event) {
  return validSession(getCookie(event, cookieName) || '', password());
}
export function checkOrigin(event: H3Event) {
  const origin = event.req.headers.get('origin');
  if (!origin || origin !== getRequestURL(event).origin || event.req.headers.get('sec-fetch-site') === 'cross-site') {
    throw createError({ statusCode: 403, statusMessage: 'Invalid origin' });
  }
}
export function secureCookie(event: H3Event) {
  return getRequestURL(event).protocol === 'https:' || process.env.NODE_ENV === 'production';
}
