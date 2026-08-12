import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, leaveSharedBoard } from '@dearbloom/shared';
import { parseSharedBoardId } from '@/src/lib/sharedBoardId';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = parseSharedBoardId((await params).id);
  if (!id) return NextResponse.json({ error: 'invalid board id' }, { status: 400 });

  try {
    await leaveSharedBoard(id, { token });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'failed' },
      { status: error instanceof ApiError ? error.status : 500 },
    );
  }
}
