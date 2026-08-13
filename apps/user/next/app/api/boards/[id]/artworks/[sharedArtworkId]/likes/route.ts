import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, likeSharedArtwork, unlikeSharedArtwork } from '@dearbloom/shared';
import { parseSharedBoardId } from '@/src/lib/sharedBoardId';

const getToken = (request: NextRequest) => request.cookies.get('accessToken')?.value;

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

async function getRequestContext(
  request: NextRequest,
  params: Promise<{ id: string; sharedArtworkId: string }>,
) {
  const token = getToken(request);
  const values = await params;
  const boardId = parseSharedBoardId(values.id);
  const sharedArtworkId = parseId(values.sharedArtworkId);
  return { token, boardId, sharedArtworkId };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sharedArtworkId: string }> },
) {
  const { token, boardId, sharedArtworkId } = await getRequestContext(request, params);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!boardId || !sharedArtworkId) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  try {
    await likeSharedArtwork(sharedArtworkId, { token });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sharedArtworkId: string }> },
) {
  const { token, boardId, sharedArtworkId } = await getRequestContext(request, params);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!boardId || !sharedArtworkId) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  try {
    await unlikeSharedArtwork(sharedArtworkId, { token });
    return new NextResponse(null, { status: 204 });
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
