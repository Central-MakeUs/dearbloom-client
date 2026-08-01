import { NextResponse, type NextRequest } from 'next/server';
import { markChatRead, ApiError } from '@dearbloom/shared';
import { getActiveRole } from '@/src/lib/activeRole';

/** 읽음 처리 프록시(방 진입 시 호출). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const token = request.cookies.get('accessToken')?.value;
  const role = token ? getActiveRole(token) : undefined;
  if (!token || !role) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { roomId } = await params;
  try {
    await markChatRead(role, roomId, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
  }
}
