const localOriginPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

export function getMetadataOrigin(
  configuredOrigin: string | undefined,
  requestHeaders: Headers,
  fallbackOrigin = 'https://dearbloom.co.kr',
) {
  const configured = configuredOrigin?.replace(/\/$/, '');
  if (configured && !localOriginPattern.test(configured)) return configured;

  const forwardedHost = requestHeaders.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost ?? requestHeaders.get('host')?.trim();
  if (!host) return fallbackOrigin;

  const forwardedProtocol = requestHeaders.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProtocol ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}
