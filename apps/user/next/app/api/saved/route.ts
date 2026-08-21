import { NextResponse, type NextRequest } from 'next/server';
import {
  saveArtwork,
  unsaveArtwork,
  unsaveArtworks,
  ApiError,
  getMemberMe,
  getSharedBoards,
  getSharedBoardSavedArtworks,
  updateSharedBoardArtworks,
} from '@dearbloom/shared';
import { remainingSharedArtworkIds } from '@/src/lib/savedArtworkCascade';

/**
 * 저장 프록시 — 클라이언트 island 는 httpOnly accessToken 쿠키를 못 읽으므로,
 * 같은 도메인(next '/app/api/saved')의 이 라우트가 쿠키를 읽어 Bearer 로 dev-api 에 전달한다.
 * astro 의 src/pages/api/saved.ts 와 동일 역할.
 */

function authToken(request: NextRequest) {
  return request.cookies.get('accessToken')?.value;
}

function errorResponse(e: unknown) {
  const status = e instanceof ApiError ? e.status : 500;
  return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status });
}

/**
 * 저장 실패 원인 구분.
 * - unauthorized: 토큰이 없거나 죽음 → 로그인부터 해야 한다.
 * - customer_required: 로그인은 됐지만 고객 프로필이 없다(작가 전용 계정) → 로그인 모달을 띄우면 안 된다.
 * 백엔드는 두 경우 모두 401 을 주므로 회원 정보를 한 번 더 확인해 갈라낸다.
 */
async function classifyFailure(token: string, error: unknown): Promise<'unauthorized' | 'customer_required' | null> {
  const backendRejected = error instanceof ApiError && error.status === 401;
  const member = await getMemberMe({ token }).catch(() => undefined);
  if (!member) return backendRejected ? 'unauthorized' : null;
  if (!member.hasCustomer) return 'customer_required';
  return backendRejected ? 'unauthorized' : null;
}

function failureResponse(reason: 'unauthorized' | 'customer_required') {
  return NextResponse.json({ error: reason }, { status: reason === 'unauthorized' ? 401 : 403 });
}

async function removeFromSharedBoards(artworkIds: number[], token: string) {
  const removedIds = new Set(artworkIds);
  const boards = await getSharedBoards({ token });

  await Promise.all(
    boards.map(async (board) => {
      const artworks = await getSharedBoardSavedArtworks(board.sharedBoardId, { token });
      const remainingIds = remainingSharedArtworkIds(artworks, removedIds);
      if (remainingIds) {
        await updateSharedBoardArtworks(board.sharedBoardId, remainingIds, { token });
      }
    }),
  );
}

/** 작품 저장 */
export async function POST(request: NextRequest) {
  const token = authToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { artworkId?: number | string };
  const id = Number(body.artworkId);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid artworkId' }, { status: 400 });

  try {
    await saveArtwork(id, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    // 이미 저장됨(409)은 원하는 상태이므로 성공으로 처리(멱등).
    if (e instanceof ApiError && e.status === 409) return new NextResponse(null, { status: 204 });
    const reason = await classifyFailure(token, e);
    if (reason) return failureResponse(reason);
    return errorResponse(e);
  }
}

/** 작품 저장 취소 — 단일 { artworkId } 또는 다중 { artworkIdList } */
export async function DELETE(request: NextRequest) {
  const token = authToken(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    artworkId?: number | string;
    artworkIdList?: (number | string)[];
  };

  // 다중 취소(편집 모드)
  if (Array.isArray(body.artworkIdList)) {
    const ids = body.artworkIdList.map(Number).filter((n) => Number.isFinite(n));
    if (ids.length === 0) return NextResponse.json({ error: 'empty artworkIdList' }, { status: 400 });
    try {
      await removeFromSharedBoards(ids, token);
      await unsaveArtworks(ids, { token });
      return new NextResponse(null, { status: 204 });
    } catch (e) {
      const reason = await classifyFailure(token, e);
      if (reason) return failureResponse(reason);
      return errorResponse(e);
    }
  }

  // 단일 취소(하트 토글)
  const id = Number(body.artworkId);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid artworkId' }, { status: 400 });
  try {
    await removeFromSharedBoards([id], token);
    await unsaveArtwork(id, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const reason = await classifyFailure(token, e);
    if (reason) return failureResponse(reason);
    return errorResponse(e);
  }
}
