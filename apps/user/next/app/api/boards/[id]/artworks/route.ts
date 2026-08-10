import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, updateSharedBoardArtworks } from '@dearbloom/shared';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { artworkIdList?: unknown };
  const artworkIdList = Array.isArray(body.artworkIdList)
    ? body.artworkIdList.map(Number).filter(Number.isFinite)
    : [];
  if (artworkIdList.length > 3) {
    return NextResponse.json({ error: 'too many artworks' }, { status: 400 });
  }

  try {
    const data = await updateSharedBoardArtworks(id, artworkIdList, { token });
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'failed' },
      { status },
    );
  }
}
