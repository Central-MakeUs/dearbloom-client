export const prerender = false;

import type { APIRoute } from 'astro';
import { ApiError, fetchPublicWithAuthFallback, getArtworkPage } from '@dearbloom/shared';
import { parseFilterParams } from '@/lib/artworkFilter';

/**
 * 작품 목록 프록시 — 무한스크롤로 다음 페이지를 받아올 때 클라이언트 island 가 부릅니다.
 * island 는 httpOnly accessToken 쿠키를 못 읽으므로, 같은 도메인의 이 엔드포인트가
 * 쿠키를 읽어 Bearer 로 붙여줍니다. (안 그러면 이어 붙는 페이지만 isSaved 가 null 이 됩니다)
 */
export const GET: APIRoute = async ({ url, cookies }) => {
  const token = cookies.get('accessToken')?.value;

  const params = parseFilterParams(url);
  const cursor = url.searchParams.get('cursor');
  if (cursor) params.cursor = cursor;
  const size = Number(url.searchParams.get('size'));
  if (Number.isInteger(size)) params.size = size;

  try {
    const { data, tokenExpired } = await fetchPublicWithAuthFallback(
      (o) => getArtworkPage(params, o),
      token,
    );
    if (tokenExpired) cookies.delete('accessToken', { path: '/' });

    return new Response(JSON.stringify(data), {
      status: 200,
      // 저장 상태(isSaved)가 섞이므로 공유 캐시 금지.
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  } catch (e) {
    console.error('[api/artworks] getArtworkPage 실패', e);
    const status = e instanceof ApiError ? e.status : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'failed' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
