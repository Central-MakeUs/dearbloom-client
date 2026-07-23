import { NextResponse, type NextRequest } from 'next/server';
import { updateCustomerName, ApiError } from '@dearbloom/shared';

/** 고객 이름 수정 프록시. */
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json()) as { name?: string };
  if (typeof body.name !== 'string') return NextResponse.json({ error: 'name required' }, { status: 400 });
  try {
    await updateCustomerName(body.name, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
