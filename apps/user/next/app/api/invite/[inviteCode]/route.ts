import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, joinSharedBoard } from '@dearbloom/shared';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteCode: string }> },
) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { inviteCode } = await params;
  if (!inviteCode || inviteCode.length > 128) {
    return NextResponse.json({ error: 'invalid invite code' }, { status: 400 });
  }

  try {
    return NextResponse.json(await joinSharedBoard(inviteCode, { token }));
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'failed' },
      { status },
    );
  }
}
