export type OAuthProvider = 'apple' | 'google';

type CreateOAuthAuthorizationUrlParams = {
  baseUrl?: string;
  provider: OAuthProvider;
};

type CreateLocalOAuthAuthorizationUrlParams = {
  baseUrl?: string;
  targetUrl: string;
};

export function createOAuthAuthorizationUrl({
  baseUrl,
  provider,
}: CreateOAuthAuthorizationUrlParams) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  return `${normalizedBaseUrl}/oauth2/${provider}/authorize`;
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
