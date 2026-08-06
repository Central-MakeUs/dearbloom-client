import { NextResponse, type NextRequest } from 'next/server';

import { setOnboardingPendingCookie } from '@/src/lib/authCookies';

/**
 * 온보딩 진행 중 마커(onboardingPending)를 서버 스코프로 맞춘다.
 *
 * 백엔드가 쿠키를 직접 심는 네이티브 로그인 경로는 next 라우트를 거치지 않아
 * 브라우저에서 `document.cookie` 로 마커를 다뤄야 했는데, 이 마커는 HttpOnly +
 * `Domain=.dearbloom.co.kr` 로 심기기 때문에 JS 로는 지울 수 없다. 그래서 마커 갱신만
 * 이 라우트로 위임해, 웹 리다이렉트 로그인에서 남은 마커도 확실히 정리되게 한다.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { needsOnboarding?: unknown };
  const response = NextResponse.json({ needsOnboarding: body.needsOnboarding === true });
  setOnboardingPendingCookie(request, response, body.needsOnboarding === true);

  return response;
}
