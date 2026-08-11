import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, createSharedComment, getSharedComments } from '@dearbloom/shared';
import { parseSharedBoardId } from '@/src/lib/sharedBoardId';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = parseSharedBoardId((await params).id);
  if (!id) return NextResponse.json({ error: 'invalid board id' }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as { content?: unknown };
  if (typeof body.content !== 'string' || !body.content.trim()) {
    return NextResponse.json({ error: 'invalid content' }, { status: 400 });
  }

  try {
    await createSharedComment(id, body.content.trim(), { token });
    return NextResponse.json(await getSharedComments(id, { token }));
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'failed' },
      { status },
    );
  }
}
