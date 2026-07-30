export const prerender = false;

import type { APIRoute } from 'astro';
import { reportArtwork, ARTWORK_REPORT_CONTENT_MAX, ApiError } from '@dearbloom/shared';

/**
 * 작품 신고 프록시 — 클라이언트 island 는 httpOnly accessToken 쿠키를 못 읽으므로,
 * 같은 도메인(astro)의 이 엔드포인트가 쿠키를 읽어 Bearer 로 dev-api 에 전달한다.
 * (src/pages/api/saved.ts 와 동일한 패턴)
 */

interface ReportBody {
  artworkId?: number | string;
  content?: string;
}

function fail(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('accessToken')?.value;
  if (!token) return fail(401, 'unauthorized');

  let body: ReportBody;
  try {
    body = (await request.json()) as ReportBody;
  } catch {
    return fail(400, 'invalid body');
  }

  const artworkId = Number(body.artworkId);
  const content = body.content?.trim() ?? '';
  if (!Number.isFinite(artworkId)) return fail(400, 'invalid artworkId');
  if (!content) return fail(400, 'content required');
  if (content.length > ARTWORK_REPORT_CONTENT_MAX) return fail(400, 'content too long');

  try {
    await reportArtwork(artworkId, content, { token });
    return new Response(null, { status: 204 });
  } catch (e) {
    // 409 = 이미 신고한 작품. 신고 취소가 없으므로 클라이언트가 '신고 완료' 상태로 전환한다.
    const status = e instanceof ApiError ? e.status : 500;
    return fail(status, e instanceof Error ? e.message : 'report failed');
  }
};
