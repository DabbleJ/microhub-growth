import { defineHandler } from 'nitro';
import { createError, getRequestURL } from 'nitro/h3';
import { checkOrigin, hasSession } from '../utils/plannerAccess';

export default defineHandler(event => {
  const path = getRequestURL(event).pathname;
  if (!path.startsWith('/api/')) return;
  event.res.headers.set('Cache-Control', 'private, no-store');
  event.res.headers.set('X-Content-Type-Options', 'nosniff');
  event.res.headers.set('Referrer-Policy', 'no-referrer');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(event.req.method)) checkOrigin(event);
  if (path !== '/api/access' && !hasSession(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Password required' });
  }
});
