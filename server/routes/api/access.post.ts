import { defineHandler } from 'nitro';
import { createError, readBody, setCookie } from 'nitro/h3';
import { checkOrigin, cookieName, equal, issueSession, password, secureCookie, sessionSeconds } from '../../utils/plannerAccess';

let attempts = 0;
let windowStart = Date.now();
export default defineHandler(async event => {
  event.res.headers.set('Cache-Control', 'no-store');
  checkOrigin(event);
  const secret = password();
  if (!secret) throw createError({ statusCode: 503, statusMessage: 'Access password is not configured' });
  if (Date.now() - windowStart > 60000) { attempts = 0; windowStart = Date.now(); }
  if (++attempts > 20) throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again in a minute.' });
  const body = await readBody<{ password?: unknown }>(event);
  if (typeof body?.password !== 'string' || body.password.length > 1024 || !equal(body.password, secret)) {
    throw createError({ statusCode: 401, statusMessage: 'Incorrect password' });
  }
  setCookie(event, cookieName, issueSession(secret), { httpOnly: true, secure: secureCookie(event), sameSite: 'lax', path: '/', maxAge: sessionSeconds });
  return { authenticated: true };
});
