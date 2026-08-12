import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, deleteSharedComment } from '@dearbloom/shared';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const commentId = Number((await params).commentId);
  if (!Number.isSafeInteger(commentId) || commentId <= 0) {
    return NextResponse.json({ error: 'invalid comment id' }, { status: 400 });
  }

  try {
    await deleteSharedComment(commentId, { token });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'failed' },
      { status },
    );
  }
}
