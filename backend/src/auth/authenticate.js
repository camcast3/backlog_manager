import { isAuthEnabled } from './oidcProvider.js';

export function authenticate() {
  return async function (request, reply) {
    if (!isAuthEnabled()) {
      request.userId = null;
      return;
    }
    if (!request.session?.userId) {
      reply.code(401).send({ error: 'Not authenticated' });
      return;
    }
    request.userId = request.session.userId;
  };
}
