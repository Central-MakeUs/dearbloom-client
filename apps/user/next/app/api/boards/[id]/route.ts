import { NextResponse, type NextRequest } from 'next/server';
import {
  ApiError,
  deleteSharedBoard,
  getCustomerMe,
  getSharedBoardPage,
  getSharedBoardSavedArtworks,
  getSharedBoards,
  getSharedComments,
  updateSharedBoardName,
} from '@dearbloom/shared';
import { isSharedBoardOwner, parseSharedBoardId } from '@/src/lib/sharedBoardId';

const getToken = (request: NextRequest) => request.cookies.get('accessToken')?.value;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = parseSharedBoardId((await params).id);
  if (!id) return NextResponse.json({ error: 'invalid board id' }, { status: 400 });
  try {
    const [boards, page, comments, savedArtworks, customer] = await Promise.all([
      getSharedBoards({ token }),
      getSharedBoardPage(id, { token }),
      getSharedComments(id, { token }),
      getSharedBoardSavedArtworks(id, { token }),
      getCustomerMe({ token }),
    ]);
    const board = boards.find((item) => item.sharedBoardId === id);
    if (!board) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({
      ...board,
      ...page,
      comments,
      isOwner: isSharedBoardOwner(customer.customerId, page.sharedMemberList),
      hasMySharedArtworks: savedArtworks.some((artwork) => artwork.isShared),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = parseSharedBoardId((await params).id);
  if (!id) return NextResponse.json({ error: 'invalid board id' }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as { sharedBoardName?: unknown };
  if (typeof body.sharedBoardName !== 'string') {
    return NextResponse.json({ error: 'invalid board name' }, { status: 400 });
  }

  try {
    return NextResponse.json(await updateSharedBoardName(id, body.sharedBoardName, { token }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = getToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const id = parseSharedBoardId((await params).id);
  if (!id) return NextResponse.json({ error: 'invalid board id' }, { status: 400 });
  try {
    return NextResponse.json(await deleteSharedBoard(id, { token }));
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
