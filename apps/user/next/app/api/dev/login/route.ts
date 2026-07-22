import { NextResponse, type NextRequest } from 'next/server';
import { devLogin, type DevRole } from '@dearbloom/shared';

/** 로그인한 역할에 맞는 착지 화면. 작가는 대시보드, 고객은 공개 피드, 미온보딩은 온보딩. */
const landingByRole: Record<DevRole, string> = {
  ARTIST: '/app/artist/dashboard',
  CUSTOMER: '/snaps',
  ONBOARDING: '/app/onboarding/basic',
};

function parseRole(value: FormDataEntryValue | string | null): DevRole | undefined {
  return value === 'ARTIST' || value === 'CUSTOMER' || value === 'ONBOARDING' ? value : undefined;
}

/**
 * 개발용 로그인 — 소셜 로그인 없이 테스트 계정(memberId, 음수)으로 로그인.
 * dev 토큰을 받아 실제 로그인과 동일하게 httpOnly 쿠키로 심는다.
 * POST(폼) 또는 GET(?memberId=) 둘 다 지원.
 *
 * 주의: 이 앱은 dev.dearbloom.co.kr/app/* 요청이 next 배포로 프록시되므로
 * request.url(=next raw 호스트) 로 절대 URL 리다이렉트하면 raw vercel 도메인으로 새어나간다.
 * 따라서 Location 을 상대경로로 반환해 브라우저가 공개 도메인 기준으로 해석하게 한다.
 */
function redirectRelative(location: string, cookies?: { accessToken: string; refreshToken: string }, secure = true) {
  const response = new NextResponse(null, { status: 303, headers: { Location: location } });
  if (cookies) {
    const options = { httpOnly: true, path: '/', sameSite: 'lax' as const, secure };
    response.cookies.set('accessToken', cookies.accessToken, options);
    response.cookies.set('refreshToken', cookies.refreshToken, options);
  }
  return response;
}

async function handleLogin(request: NextRequest, memberId: number, role?: DevRole) {
  if (!Number.isFinite(memberId)) return redirectRelative('/app/dev/login?error=invalid');

  let tokens;
  try {
    tokens = await devLogin(memberId, role);
  } catch {
    return redirectRelative('/app/dev/login?error=login_failed');
  }

  // 역할 지정 시 해당 역할 화면으로, 없으면 기존처럼 dev/login 에 머무름.
  const location = role ? landingByRole[role] : '/app/dev/login?ok=1';
  return redirectRelative(location, tokens, request.nextUrl.protocol === 'https:');
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  return handleLogin(request, Number(formData.get('memberId')), parseRole(formData.get('role')));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  return handleLogin(request, Number(params.get('memberId')), parseRole(params.get('role')));
}
