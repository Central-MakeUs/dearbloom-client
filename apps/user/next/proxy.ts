import { NextResponse, type NextRequest } from 'next/server';

import { refreshMemberToken, type MemberRole } from '@dearbloom/shared';

import { expireAuthCookie, setAuthCookie } from './src/lib/authCookies.ts';

export async function proxy(request: NextRequest) {
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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
