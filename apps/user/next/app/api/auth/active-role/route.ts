import { NextResponse, type NextRequest } from 'next/server';

import type { MemberRole } from '@dearbloom/shared';

import { setAuthCookie } from '@/src/lib/authCookies';

export async function POST(request: NextRequest) {
  if (!request.cookies.has('accessToken')) {
    return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 });
  }

  const role = await readRole(request);
  if (!role) return NextResponse.json({ error: '유효한 역할이 필요해요.' }, { status: 400 });

  const response = new NextResponse(null, { status: 204 });
  setAuthCookie(request, response, 'activeRole', role);
  return response;
}

async function readRole(request: NextRequest): Promise<MemberRole | undefined> {
  try {
    const { role } = (await request.json()) as { role?: unknown };
    return role === 'CUSTOMER' || role === 'ARTIST' ? role : undefined;
  } catch {
    return undefined;
  }
}
