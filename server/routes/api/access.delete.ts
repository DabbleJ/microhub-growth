import { defineHandler } from 'nitro';
import { deleteCookie } from 'nitro/h3';
import { checkOrigin, cookieName } from '../../utils/plannerAccess';

export default defineHandler(event => {
  checkOrigin(event);
  event.res.headers.set('Cache-Control', 'no-store');
  deleteCookie(event, cookieName, { path: '/' });
  return { authenticated: false };
});
