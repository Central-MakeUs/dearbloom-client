import type { NextRequest, NextResponse } from 'next/server';

export type MemberRole = 'CUSTOMER' | 'ARTIST';
type AuthCookieName = 'accessToken' | 'refreshToken' | 'activeRole';

const DEVELOPMENT_TOKEN_MAX_AGE = {
  accessToken: 10_800,
  refreshToken: 604_800,
} as const;

const PRODUCTION_TOKEN_MAX_AGE = {
  accessToken: 1_800,
  refreshToken: 2_592_000,
} as const;

export function setAuthCookie(
  request: NextRequest,
  response: NextResponse,
  name: AuthCookieName,
  value: string,
) {
  const writtenNames: AuthCookieName[] = [name];
  const clearsHostOnlyCookie = writeAuthCookie(request, response, name, value);

  if (name === 'accessToken') {
    const role = getTokenActiveRole(value);
    if (role) writeAuthCookie(request, response, 'activeRole', role);
    if (role) writtenNames.push('activeRole');
  }

  if (clearsHostOnlyCookie)
    writtenNames.forEach((cookieName) => clearHostOnlyCookie(response, cookieName));
}

export function expireAuthCookie(
  request: NextRequest,
  response: NextResponse,
  name: AuthCookieName,
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

export function getAuthCookieMaxAge(
  name: AuthCookieName,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL,
) {
  const maxAge =
    apiBaseUrl?.replace(/\/$/, '') === 'https://api.dearbloom.co.kr'
      ? PRODUCTION_TOKEN_MAX_AGE
      : DEVELOPMENT_TOKEN_MAX_AGE;
  return name === 'accessToken' ? maxAge.accessToken : maxAge.refreshToken;
}

export function getTokenActiveRole(token: string): MemberRole | undefined {
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;

    const { activeRole } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      activeRole?: unknown;
    };
    return activeRole === 'CUSTOMER' || activeRole === 'ARTIST' ? activeRole : undefined;
  } catch {
    return undefined;
  }
}

export function getAuthCookieOptions(request: NextRequest, maxAge?: number) {
  const hostname = getRequestHostname(request);
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const isDearBloomHost = hostname === 'dearbloom.co.kr' || hostname.endsWith('.dearbloom.co.kr');

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

function writeAuthCookie(
  request: NextRequest,
  response: NextResponse,
  name: AuthCookieName,
  value: string,
) {
  const options = getAuthCookieOptions(request, getAuthCookieMaxAge(name));
  response.cookies.set(name, value, options);
  return Boolean(options.domain);
}

function clearHostOnlyCookie(response: NextResponse, name: AuthCookieName) {
  response.headers.append(
    'Set-Cookie',
    `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax; Secure`,
  );
}
