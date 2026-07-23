import { NextResponse, type NextRequest } from 'next/server';
import { reserveInquiry, reserveCancelInquiry, cancelReceivedInquiry, ApiError } from '@dearbloom/shared';

type Action = 'reserve' | 'reserve-cancel' | 'cancel';

/** 작가 받은 문의 상태 변경 프록시. body: { action }. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const { action } = (await request.json()) as { action?: Action };
  try {
    if (action === 'reserve') await reserveInquiry(id, { token });
    else if (action === 'reserve-cancel') await reserveCancelInquiry(id, { token });
    else if (action === 'cancel') await cancelReceivedInquiry(id, { token });
    else return NextResponse.json({ error: 'invalid action' }, { status: 400 });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
