import { defineHandler } from 'nitro';
import { createError, getRequestURL } from 'nitro/h3';
import { hasSession } from '../utils/plannerAccess';

export default defineHandler(event => {
  const path = getRequestURL(event).pathname;
  if (path.startsWith('/api/') && path !== '/api/access' && !hasSession(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Password required' });
  }
});
