import { defineHandler } from 'nitro';
import { hasSession, password } from '../../utils/plannerAccess';

export default defineHandler(event => {
  event.res.headers.set('Cache-Control', 'no-store');
  return { authenticated: hasSession(event), configured: Boolean(password()) };
});
