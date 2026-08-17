import { NextResponse, type NextRequest } from 'next/server';

import type { MemberRole } from '@dearbloom/shared';

import { setAuthCookie, setOnboardingPendingCookie } from '@/src/lib/authCookies';

export async function POST(request: NextRequest) {
  if (!request.cookies.has('accessToken')) {
    return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 });
  }

  const payload = await readPayload(request);
  if (!payload) return NextResponse.json({ error: '유효한 역할이 필요해요.' }, { status: 400 });

  const response = new NextResponse(null, { status: 204 });
  setAuthCookie(request, response, 'activeRole', payload.role);
  setOnboardingPendingCookie(request, response, payload.onboardingPending);
  return response;
}

async function readPayload(
  request: NextRequest,
): Promise<{ onboardingPending: boolean; role: MemberRole } | undefined> {
  try {
    const { onboardingPending, role } = (await request.json()) as {
      onboardingPending?: unknown;
      role?: unknown;
    };
    return (role === 'CUSTOMER' || role === 'ARTIST') && typeof onboardingPending === 'boolean'
      ? { onboardingPending, role }
      : undefined;
  } catch {
    return undefined;
  }
}
