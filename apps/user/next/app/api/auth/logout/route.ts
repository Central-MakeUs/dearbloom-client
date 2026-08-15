import { NextResponse, type NextRequest } from 'next/server';
import { logoutMember } from '@dearbloom/shared';

import { expireAuthCookie } from '@/src/lib/authCookies';
import { withFlashToast } from '@/src/lib/flashToast';

export async function GET(request: NextRequest) {
  // 서버측 세션(refresh) 무효화. 실패해도 쿠키는 만료시켜 클라이언트 로그아웃은 보장.
  const token = request.cookies.get('accessToken')?.value;
  if (token) await logoutMember({ token }).catch(() => undefined);

  // 로그아웃 후에는 공개 피드(astro /snaps)로 이동.
  const toastKind = request.nextUrl.searchParams.get('_toast') === 'withdrawal'
    ? 'withdrawal'
    : 'logout';
  const response = NextResponse.redirect(
    new URL(withFlashToast('/snaps', toastKind), getPublicOrigin(request)),
  );

  expireAuthCookie(request, response, 'accessToken');
  expireAuthCookie(request, response, 'refreshToken');
  expireAuthCookie(request, response, 'activeRole');

  return response;
}

function getPublicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host') ?? request.nextUrl.host;
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto ?? request.nextUrl.protocol.replace(':', '');

  return `${protocol}://${host}`;
}
