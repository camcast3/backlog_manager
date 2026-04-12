let _oidcModule = null;
let _config = null;

export function isAuthEnabled() {
  return !!(
    process.env.OIDC_ISSUER &&
    process.env.OIDC_CLIENT_ID &&
    process.env.OIDC_CLIENT_SECRET &&
    process.env.OIDC_REDIRECT_URI
  );
}

async function getOidc() {
  if (!_oidcModule) {
    _oidcModule = await import('openid-client');
  }
  return _oidcModule;
}

export async function getOidcConfig() {
  if (_config) return _config;

  const oidc = await getOidc();
  _config = await oidc.discovery(
    new URL(process.env.OIDC_ISSUER),
    process.env.OIDC_CLIENT_ID,
    process.env.OIDC_CLIENT_SECRET,
  );

  return _config;
}

export { getOidc };
