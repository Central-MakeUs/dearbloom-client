import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, createSharedBoard } from '@dearbloom/shared';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { sharedBoardName?: unknown };
  if (typeof body.sharedBoardName !== 'string') {
    return NextResponse.json({ error: 'invalid board name' }, { status: 400 });
  }

  try {
    return NextResponse.json(await createSharedBoard(body.sharedBoardName, { token }));
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'failed' },
      { status },
    );
  }
}
