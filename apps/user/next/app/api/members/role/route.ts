import { NextResponse, type NextRequest } from 'next/server';

import {
  ApiError,
  getMemberMe,
  switchMemberRole,
  type MemberRole,
} from '@dearbloom/shared';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return errorResponse(401, '로그인이 필요합니다.');

  const role = await getRole(request);
  if (!role) return errorResponse(400, '역할이 올바르지 않습니다.');

  try {
    const member = await getMemberMe({ token });
    const hasProfile = role === 'CUSTOMER' ? member.hasCustomer : member.hasArtist;

    if (!hasProfile) {
      return NextResponse.json({
        destination: role === 'CUSTOMER' ? '/app/onboarding' : '/app/onboarding/artist',
      });
    }

    const result = await switchMemberRole(role, { token });
    const response = NextResponse.json({ destination: getHome(role) });
    response.cookies.set('accessToken', result.accessToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });

    return response;
  } catch (error) {
    return error instanceof ApiError
      ? errorResponse(error.status, error.message)
      : errorResponse(502, '역할을 선택하지 못했습니다.');
  }
}

async function getRole(request: NextRequest): Promise<MemberRole | undefined> {
  try {
    const body = (await request.json()) as { role?: unknown };
    return body.role === 'CUSTOMER' || body.role === 'ARTIST' ? body.role : undefined;
  } catch {
    return undefined;
  }
}

function getHome(role: MemberRole) {
  return role === 'CUSTOMER' ? '/snaps' : '/app/artist/dashboard';
}

function errorResponse(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}
