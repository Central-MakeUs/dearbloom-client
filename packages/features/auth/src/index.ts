export type OAuthProvider = 'apple' | 'google';
export type AuthRole = 'ARTIST' | 'CUSTOMER';

type CreateOAuthAuthorizationUrlParams = {
  baseUrl?: string;
  provider: OAuthProvider;
  role: AuthRole;
};

type CreateLocalOAuthAuthorizationUrlParams = {
  baseUrl?: string;
  targetUrl: string;
};

export function createOAuthAuthorizationUrl({
  baseUrl,
  provider,
  role,
}: CreateOAuthAuthorizationUrlParams) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const searchParams = new URLSearchParams({ role });

  return `${normalizedBaseUrl}/oauth2/${provider}/authorize?${searchParams.toString()}`;
}

export function createLocalOAuthAuthorizationUrl({
  baseUrl,
  targetUrl,
}: CreateLocalOAuthAuthorizationUrlParams) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const searchParams = new URLSearchParams({ target: targetUrl });

  return `${normalizedBaseUrl}/oauth2/local/entry?${searchParams.toString()}`;
}

function normalizeBaseUrl(baseUrl?: string) {
  return baseUrl?.replace(/\/$/, '') ?? '';
}
