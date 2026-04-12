import { getOidcConfig, isAuthEnabled, getOidc } from '../auth/oidcProvider.js';
import { getDb } from '../db/index.js';

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

    const oidc = await getOidc();
    const config = await getOidcConfig();
    const nonce = oidc.randomNonce();
    const state = oidc.randomState();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    request.session.oidcNonce = nonce;
    request.session.oidcState = state;
    request.session.oidcCodeVerifier = codeVerifier;

    const authUrl = oidc.buildAuthorizationUrl(config, {
      redirect_uri: process.env.OIDC_REDIRECT_URI,
      scope: 'openid profile email',
      nonce,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return reply.redirect(authUrl.href);
  });

  // GET /auth/callback — handle OIDC callback
  fastify.get('/callback', async (request, reply) => {
    if (!isAuthEnabled()) {
      return reply.redirect('/');
    }

    const oidc = await getOidc();
    const config = await getOidcConfig();
    const currentUrl = new URL(request.url, `${request.protocol}://${request.hostname}`);

    const tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: request.session.oidcCodeVerifier,
      expectedNonce: request.session.oidcNonce,
      expectedState: request.session.oidcState,
    });

    const claims = tokens.claims();
    const userInfo = await oidc.fetchUserInfo(config, tokens.access_token, claims.sub);

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

    delete request.session.oidcNonce;
    delete request.session.oidcState;
    delete request.session.oidcCodeVerifier;

    return reply.redirect('/');
  });

  // POST /auth/logout — destroy session
  fastify.post('/logout', async (request, reply) => {
    request.session.destroy();
    return { ok: true };
  });
}
