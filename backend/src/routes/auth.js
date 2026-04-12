import { generators } from 'openid-client';
import { getOidcClient, isAuthEnabled } from '../auth/oidcProvider.js';
import getDb from '../db/index.js';

export default async function authRoutes(fastify) {
  const sql = getDb();

  // GET /auth/me — current user info
  fastify.get('/me', async (request) => {
    if (!isAuthEnabled()) {
      return { authenticated: false, authEnabled: false };
    }
    if (!request.session?.userId) {
      return { authenticated: false, authEnabled: true };
    }
    return { authenticated: true, authEnabled: true, ...request.session.user };
  });

  // GET /auth/login — redirect to OIDC provider
  fastify.get('/login', async (request, reply) => {
    if (!isAuthEnabled()) {
      return reply.redirect('/');
    }

    const client = await getOidcClient();
    const nonce = generators.nonce();
    const state = generators.state();

    request.session.oidcNonce = nonce;
    request.session.oidcState = state;

    const authUrl = client.authorizationUrl({
      scope: 'openid profile email',
      nonce,
      state,
    });

    return reply.redirect(authUrl);
  });

  // GET /auth/callback — handle OIDC callback
  fastify.get('/callback', async (request, reply) => {
    if (!isAuthEnabled()) {
      return reply.redirect('/');
    }

    const client = await getOidcClient();
    const params = client.callbackParams(request.raw);

    const tokenSet = await client.callback(
      process.env.OIDC_REDIRECT_URI,
      params,
      {
        nonce: request.session.oidcNonce,
        state: request.session.oidcState,
      }
    );

    const userInfo = await client.userinfo(tokenSet.access_token);

    const [user] = await sql`
      INSERT INTO users (sub, display_name, email, avatar_url)
      VALUES (${userInfo.sub}, ${userInfo.name || userInfo.preferred_username || null}, ${userInfo.email || null}, ${userInfo.picture || null})
      ON CONFLICT (sub) DO UPDATE SET
        display_name = ${userInfo.name || userInfo.preferred_username || null},
        email = ${userInfo.email || null},
        avatar_url = ${userInfo.picture || null},
        last_login = NOW()
      RETURNING *
    `;

    request.session.userId = user.id;
    request.session.user = user;

    // Clean up OIDC state
    delete request.session.oidcNonce;
    delete request.session.oidcState;

    return reply.redirect('/');
  });

  // POST /auth/logout — destroy session
  fastify.post('/logout', async (request, reply) => {
    request.session.destroy();
    return { ok: true };
  });
}
