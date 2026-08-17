import { NextResponse, type NextRequest } from 'next/server';

import { logoutMember, refreshMemberToken, type MemberRole } from '@dearbloom/shared';

import { expireAuthCookie, setAuthCookie } from './src/lib/authCookies.ts';
import { shouldCancelPendingOnboarding } from './src/lib/onboardingRoute.ts';

export async function proxy(request: NextRequest) {
  if (
    request.cookies.has('onboardingPending') &&
    shouldCancelPendingOnboarding(request.nextUrl.pathname, request.headers)
  ) {
    const token = request.cookies.get('accessToken')?.value;
    if (token) await logoutMember({ token }).catch(() => undefined);

    const response = NextResponse.next({
      request: { headers: withoutAuthCookies(request.headers) },
    });
    expireAuthCookie(request, response, 'accessToken');
    expireAuthCookie(request, response, 'refreshToken');
    expireAuthCookie(request, response, 'activeRole');
    expireAuthCookie(request, response, 'onboardingPending');
    return response;
  }

  if (request.cookies.has('accessToken')) return NextResponse.next();

  const refreshToken = request.cookies.get('refreshToken')?.value;
  const role = getMemberRole(request.cookies.get('activeRole')?.value);
  if (!refreshToken || !role) return NextResponse.next();

  try {
    const tokens = await refreshMemberToken({ refreshToken, role });
    const requestHeaders = withAccessToken(request.headers, tokens.accessToken);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    setAuthCookie(request, response, 'accessToken', tokens.accessToken);
    return response;
  } catch {
    const response = NextResponse.next();
    expireAuthCookie(request, response, 'accessToken');
    expireAuthCookie(request, response, 'refreshToken');
    expireAuthCookie(request, response, 'activeRole');
    return response;
  }
}

function getMemberRole(value?: string): MemberRole | undefined {
  return value === 'CUSTOMER' || value === 'ARTIST' ? value : undefined;
}

function withAccessToken(headers: Headers, accessToken: string) {
  const requestHeaders = new Headers(headers);
  const cookies = requestHeaders.get('cookie');
  requestHeaders.set('cookie', `${cookies ? `${cookies}; ` : ''}accessToken=${accessToken}`);
  return requestHeaders;
}

function withoutAuthCookies(headers: Headers) {
  const requestHeaders = new Headers(headers);
  const authCookieNames = new Set([
    'accessToken',
    'refreshToken',
    'activeRole',
    'onboardingPending',
  ]);
  const cookies = requestHeaders
    .get('cookie')
    ?.split(';')
    .filter((cookie) => !authCookieNames.has(cookie.trim().split('=')[0] ?? ''))
    .join('; ');

  if (cookies) requestHeaders.set('cookie', cookies);
  else requestHeaders.delete('cookie');
  return requestHeaders;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
