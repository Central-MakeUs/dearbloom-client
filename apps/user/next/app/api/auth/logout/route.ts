import { NextResponse, type NextRequest } from 'next/server';
import { logoutMember } from '@dearbloom/shared';

export async function GET(request: NextRequest) {
  // 서버측 세션(refresh) 무효화. 실패해도 쿠키는 만료시켜 클라이언트 로그아웃은 보장.
  const token = request.cookies.get('accessToken')?.value;
  if (token) await logoutMember({ token }).catch(() => undefined);

  // 로그아웃 후에는 공개 피드(astro /snaps)로 이동.
  const response = NextResponse.redirect(new URL('/snaps', getPublicOrigin(request)));

  expireAuthCookie(request, response, 'accessToken');
  expireAuthCookie(request, response, 'refreshToken');

  return response;
}

function getPublicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? request.nextUrl.host;
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(':', '');

  return `${protocol}://${host}`;
}

function expireAuthCookie(request: NextRequest, response: NextResponse, name: string) {
  const expiredCookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=Lax`;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  const hostname = host.split(':')[0] ?? request.nextUrl.hostname;

  response.headers.append('Set-Cookie', expiredCookie);

  if (hostname === 'dearbloom.co.kr' || hostname.endsWith('.dearbloom.co.kr')) {
    response.headers.append('Set-Cookie', `${expiredCookie}; Domain=.dearbloom.co.kr; Secure`);
  }
}
