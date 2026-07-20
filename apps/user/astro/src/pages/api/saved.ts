export const prerender = false;

import type { APIRoute } from 'astro';
import { saveArtwork, unsaveArtwork, ApiError } from '@dearbloom/shared';

/**
 * 저장 프록시 — 클라이언트 island 는 httpOnly accessToken 쿠키를 못 읽으므로,
 * 같은 도메인(astro)의 이 엔드포인트가 쿠키를 읽어 Bearer 로 dev-api 에 전달한다.
 */

async function readArtworkId(request: Request): Promise<number | null> {
  try {
    const body = (await request.json()) as { artworkId?: number | string };
    const id = Number(body.artworkId);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
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

  const artworkId = await readArtworkId(request);
  if (artworkId === null) return fail(400, 'invalid artworkId');

  try {
    await saveArtwork(artworkId, { token });
    return new Response(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return fail(status, e instanceof Error ? e.message : 'save failed');
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('accessToken')?.value;
  if (!token) return fail(401, 'unauthorized');

  const artworkId = await readArtworkId(request);
  if (artworkId === null) return fail(400, 'invalid artworkId');

  try {
    await unsaveArtwork(artworkId, { token });
    return new Response(null, { status: 204 });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    return fail(status, e instanceof Error ? e.message : 'unsave failed');
  }
};
