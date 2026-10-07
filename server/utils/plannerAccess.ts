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
export function hasSession(event: H3Event) {
  const secret = password();
  const token = getCookie(event, cookieName) || '';
  if (!secret || token.length > 200) return false;
  const [expires, nonce, signature] = token.split('.');
  if (!expires || !nonce || !signature || Number(expires) <= Date.now()) return false;
  const expected = createHmac('sha256', secret).update(`${expires}.${nonce}`).digest('hex');
  return equal(signature, expected);
}
export function checkOrigin(event: H3Event) {
  const origin = event.req.headers.get('origin');
  if (origin && origin !== getRequestURL(event).origin) throw createError({ statusCode: 403, statusMessage: 'Invalid origin' });
}
export function secureCookie(event: H3Event) {
  return getRequestURL(event).protocol === 'https:' || process.env.NODE_ENV === 'production';
}
