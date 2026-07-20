import { NextResponse, type NextRequest } from 'next/server';
import { devLogin } from '@dearbloom/shared';

/**
 * 개발용 로그인 — 소셜 로그인 없이 테스트 계정(memberId, 음수)으로 로그인.
 * dev 토큰을 받아 실제 로그인과 동일하게 httpOnly 쿠키로 심는다.
 * POST(폼) 또는 GET(?memberId=) 둘 다 지원(GET 은 navigate 만으로 로그인용 dev 편의).
 */
async function handleLogin(request: NextRequest, memberId: number) {
  const back = (params: string) => NextResponse.redirect(new URL(`/app/dev/login?${params}`, request.url));

  if (!Number.isFinite(memberId)) return back('error=invalid');

  let tokens;
  try {
    tokens = await devLogin(memberId);
  } catch {
    return back('error=login_failed');
  }

  const response = back('ok=1');
  const cookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: request.nextUrl.protocol === 'https:',
  };
  response.cookies.set('accessToken', tokens.accessToken, cookieOptions);
  response.cookies.set('refreshToken', tokens.refreshToken, cookieOptions);
  return response;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  return handleLogin(request, Number(formData.get('memberId')));
}

export async function GET(request: NextRequest) {
  return handleLogin(request, Number(request.nextUrl.searchParams.get('memberId')));
}
