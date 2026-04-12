import { Issuer } from 'openid-client';

let _client = null;

export function isAuthEnabled() {
  return !!(
    process.env.OIDC_ISSUER &&
    process.env.OIDC_CLIENT_ID &&
    process.env.OIDC_CLIENT_SECRET &&
    process.env.OIDC_REDIRECT_URI
  );
}

export async function getOidcClient() {
  if (_client) return _client;

  const issuer = await Issuer.discover(process.env.OIDC_ISSUER);
  _client = new issuer.Client({
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    redirect_uris: [process.env.OIDC_REDIRECT_URI],
    response_types: ['code'],
  });

  return _client;
}
