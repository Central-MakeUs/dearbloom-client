import { NextResponse, type NextRequest } from 'next/server';
import { devLogin, type DevRole } from '@dearbloom/shared';

import { DEV_LOGIN_ENABLED } from '@/src/lib/env';
import { setAuthCookie } from '@/src/lib/authCookies';

/**
 * 개발용 로그인 — 소셜 로그인 없이 테스트 계정(memberId, 음수)으로 로그인.
 * dev 토큰을 받아 실제 로그인과 동일하게 httpOnly 쿠키로 심는다.
 * POST(폼) 또는 GET(?memberId=) 둘 다 지원.
 *
 * 주의: 이 앱은 dev.dearbloom.co.kr/app/* 요청이 next 배포로 프록시되므로
 * request.url(=next raw 호스트) 로 절대 URL 리다이렉트하면 raw vercel 도메인으로 새어나간다.
 * 따라서 Location 을 상대경로로 반환해 브라우저가 공개 도메인 기준으로 해석하게 한다.
 */
function redirectRelative(
  request: NextRequest,
  location: string,
  cookies?: { accessToken: string; refreshToken: string },
) {
  const response = new NextResponse(null, { status: 303, headers: { Location: location } });
  if (cookies) {
    setAuthCookie(request, response, 'accessToken', cookies.accessToken);
    setAuthCookie(request, response, 'refreshToken', cookies.refreshToken);
  }
  return response;
}

function readRole(value: unknown): DevRole | undefined {
  return value === 'CUSTOMER' || value === 'ARTIST' ? value : undefined;
}

/** 역할을 지정해 로그인하면 역할 선택을 건너뛰고 그 역할의 홈으로 보낸다. */
const HOME_BY_ROLE: Record<DevRole, string> = {
  ARTIST: '/app/artist/dashboard',
  CUSTOMER: '/snaps',
  ONBOARDING: '/app/role',
};

async function handleLogin(request: NextRequest, memberId: number, role?: DevRole) {
  if (!Number.isFinite(memberId)) return redirectRelative(request, '/app/dev/login?error=invalid');

  let tokens;
  try {
    tokens = await devLogin(memberId, role);
  } catch {
    return redirectRelative(request, '/app/dev/login?error=login_failed');
  }

  return redirectRelative(request, role ? HOME_BY_ROLE[role] : '/app/role', tokens);
}

export async function POST(request: NextRequest) {
  if (!DEV_LOGIN_ENABLED) return new NextResponse(null, { status: 404 });
  const formData = await request.formData();
  return handleLogin(request, Number(formData.get('memberId')), readRole(formData.get('role')));
}

export async function GET(request: NextRequest) {
  if (!DEV_LOGIN_ENABLED) return new NextResponse(null, { status: 404 });
  const { searchParams } = request.nextUrl;
  return handleLogin(request, Number(searchParams.get('memberId')), readRole(searchParams.get('role')));
}
