import { NextResponse, type NextRequest } from 'next/server';
import { updateCustomerProfile, ApiError, type CustomerProfilePatch } from '@dearbloom/shared';

/** 고객 프로필(이름·지역) 수정 프록시. 미전송 필드는 미변경. */
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as CustomerProfilePatch;
  try {
    await updateCustomerProfile(body, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
