import { NextResponse, type NextRequest } from 'next/server';
import { createInquiry, ApiError, type InquiryCreatePayload } from '@dearbloom/shared';

/** 스마트 문의 전송 프록시. */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const payload = (await request.json()) as InquiryCreatePayload;
  try {
    const data = await createInquiry(payload, { token });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
