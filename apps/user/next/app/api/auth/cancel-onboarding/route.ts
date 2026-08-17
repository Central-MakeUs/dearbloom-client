import { NextResponse, type NextRequest } from 'next/server';

import { logoutMember } from '@dearbloom/shared';

import { expireAuthCookie } from '@/src/lib/authCookies';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (token) await logoutMember({ token }).catch(() => undefined);

  const response = new NextResponse(null, {
    headers: { Location: '/snaps' },
    status: 303,
  });
  expireAuthCookie(request, response, 'accessToken');
  expireAuthCookie(request, response, 'refreshToken');
  expireAuthCookie(request, response, 'activeRole');
  expireAuthCookie(request, response, 'onboardingPending');
  return response;
}
