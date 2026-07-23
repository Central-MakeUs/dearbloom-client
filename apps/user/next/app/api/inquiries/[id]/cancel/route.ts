import { NextResponse, type NextRequest } from 'next/server';
import { cancelMyInquiry, ApiError } from '@dearbloom/shared';

/** 고객 문의 취소 프록시. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await cancelMyInquiry(id, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
