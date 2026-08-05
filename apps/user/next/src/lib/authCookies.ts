import type { NextRequest, NextResponse } from 'next/server';

type AuthCookieName = 'accessToken' | 'refreshToken';
type SessionCookieName = AuthCookieName | 'onboardingPending';
type TokenRole = 'ARTIST' | 'CUSTOMER';
const PENDING_ONBOARDING_MAX_AGE = 60 * 60 * 24 * 30;

export function setAuthCookie(
  request: NextRequest,
  response: NextResponse,
  name: AuthCookieName,
  value: string,
) {
  const options = getAuthCookieOptions(request, getTokenMaxAge(value));
  response.cookies.set(name, value, options);

  if (options.domain && getRequestHostname(request) !== 'dearbloom.co.kr') {
    response.headers.append(
      'Set-Cookie',
      `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax; Secure`,
    );
  }
}

export function setOnboardingPendingCookie(
  request: NextRequest,
  response: NextResponse,
  pending: boolean,
) {
  if (!pending) {
    expireAuthCookie(request, response, 'onboardingPending');
    return;
  }

  const options = getAuthCookieOptions(request, PENDING_ONBOARDING_MAX_AGE);
  response.cookies.set('onboardingPending', '1', options);

  if (options.domain) {
    response.headers.append(
      'Set-Cookie',
      'onboardingPending=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax; Secure',
    );
  }
}

export function expireAuthCookie(
  request: NextRequest,
  response: NextResponse,
  name: SessionCookieName,
) {
  const expiredCookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax`;
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  const hostname = host.split(':')[0] ?? request.nextUrl.hostname;

  response.headers.append('Set-Cookie', expiredCookie);

  if (hostname === 'dearbloom.co.kr' || hostname.endsWith('.dearbloom.co.kr')) {
    response.headers.append('Set-Cookie', `${expiredCookie}; Domain=.dearbloom.co.kr; Secure`);
  }
}

export function getTokenMaxAge(token: string, now = Math.floor(Date.now() / 1000)) {
  const exp = getTokenPayload(token)?.exp;

  return typeof exp === 'number' && Number.isFinite(exp)
    ? Math.max(0, Math.floor(exp - now))
    : undefined;
}

export function getTokenActiveRole(token: string): TokenRole | undefined {
  const activeRole = getTokenPayload(token)?.activeRole;
  return activeRole === 'ARTIST' || activeRole === 'CUSTOMER' ? activeRole : undefined;
}

function getTokenPayload(token: string): Record<string, unknown> | undefined {
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;

    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<
      string,
      unknown
    >;
  } catch {
    return undefined;
  }
}

export function getAuthCookieOptions(request: NextRequest, maxAge?: number) {
  const hostname = getRequestHostname(request);
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const isDearBloomHost =
    hostname === 'dearbloom.co.kr' || hostname.endsWith('.dearbloom.co.kr');

  return {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure:
      isDearBloomHost ||
      (forwardedProtocol ? forwardedProtocol === 'https' : request.nextUrl.protocol === 'https:'),
    ...(maxAge === undefined ? {} : { maxAge }),
    ...(isDearBloomHost ? { domain: '.dearbloom.co.kr' } : {}),
  };
}

function getRequestHostname(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = forwardedHost ?? request.headers.get('host') ?? request.nextUrl.hostname;
  return (host.split(':')[0] ?? request.nextUrl.hostname).toLowerCase();
}
