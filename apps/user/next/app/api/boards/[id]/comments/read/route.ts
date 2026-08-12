import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, markSharedCommentsRead } from '@dearbloom/shared';
import { parseSharedBoardId } from '@/src/lib/sharedBoardId';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = parseSharedBoardId((await params).id);
  if (!id) return NextResponse.json({ error: 'invalid board id' }, { status: 400 });

  try {
    await markSharedCommentsRead(id, { token });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'failed' },
      { status },
    );
  }
}
