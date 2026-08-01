import { NextResponse, type NextRequest } from 'next/server';
import { getChatMessages, sendChatText, ApiError } from '@dearbloom/shared';
import { getActiveRole } from '@/src/lib/activeRole';

/** 메시지 히스토리 프록시. ?cursor= 로 위쪽(과거) 페이지를 이어 받습니다. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const token = request.cookies.get('accessToken')?.value;
  const role = token ? getActiveRole(token) : undefined;
  if (!token || !role) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { roomId } = await params;
  const cursor = request.nextUrl.searchParams.get('cursor');
  const size = request.nextUrl.searchParams.get('size');

  try {
    const data = await getChatMessages(
      role,
      roomId,
      { cursor: cursor ? Number(cursor) : undefined, size: size ? Number(size) : undefined },
      { token },
    );
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}

/** 텍스트 메시지 전송 프록시. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const token = request.cookies.get('accessToken')?.value;
  const role = token ? getActiveRole(token) : undefined;
  if (!token || !role) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { roomId } = await params;
  const { content } = (await request.json()) as { content?: string };
  if (!content?.trim()) return NextResponse.json({ error: 'content required' }, { status: 400 });

  try {
    const data = await sendChatText(role, roomId, content, { token });
    return NextResponse.json(data);
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
