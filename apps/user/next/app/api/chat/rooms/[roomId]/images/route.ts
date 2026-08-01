import { NextResponse, type NextRequest } from 'next/server';
import { sendChatImage, ApiError } from '@dearbloom/shared';
import { getActiveRole } from '@/src/lib/activeRole';

/** 이미지 메시지 전송 프록시. presigned(prefix=CHAT_IMAGE) 업로드로 받은 CDN URL 한 장. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const token = request.cookies.get('accessToken')?.value;
  const role = token ? getActiveRole(token) : undefined;
  if (!token || !role) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { roomId } = await params;
  const { imageUrl } = (await request.json()) as { imageUrl?: string };
  if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });

  try {
    const data = await sendChatImage(role, roomId, imageUrl, { token });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
