import { NextResponse, type NextRequest } from 'next/server';
import { saveArtwork, unsaveArtwork, unsaveArtworks, ApiError } from '@dearbloom/shared';

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
      await unsaveArtworks(ids, { token });
      return new NextResponse(null, { status: 204 });
    } catch (e) {
      return errorResponse(e);
    }
  }

  // 단일 취소(하트 토글)
  const id = Number(body.artworkId);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid artworkId' }, { status: 400 });
  try {
    await unsaveArtwork(id, { token });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
