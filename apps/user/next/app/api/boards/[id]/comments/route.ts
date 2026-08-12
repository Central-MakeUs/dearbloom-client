import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, createSharedComment, getSharedComments } from '@dearbloom/shared';
import { parseSharedBoardId } from '@/src/lib/sharedBoardId';

const getToken = (request: NextRequest) => request.cookies.get('accessToken')?.value;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = parseSharedBoardId((await params).id);
  if (!id) return NextResponse.json({ error: 'invalid board id' }, { status: 400 });

  try {
    return NextResponse.json(await getSharedComments(id, { token }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = parseSharedBoardId((await params).id);
  if (!id) return NextResponse.json({ error: 'invalid board id' }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as { content?: unknown };
  if (
    typeof body.content !== 'string' ||
    !body.content.trim() ||
    body.content.trim().length > 500
  ) {
    return NextResponse.json({ error: 'invalid content' }, { status: 400 });
  }

  try {
    await createSharedComment(id, body.content.trim(), { token });
    return NextResponse.json(await getSharedComments(id, { token }));
  } catch (error) {
    return apiError(error);
  }
}

function apiError(error: unknown) {
  const status = error instanceof ApiError ? error.status : 500;
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'failed' },
    { status },
  );
}
