export const prerender = false;

import type { APIRoute } from 'astro';
import { saveArtwork, unsaveArtwork, ApiError, getMemberMe } from '@dearbloom/shared';

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

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('accessToken')?.value;
  if (!token) return fail(401, 'unauthorized');

  const artworkId = await readArtworkId(request);
  if (artworkId === null) return fail(400, 'invalid artworkId');

  try {
    await saveArtwork(artworkId, { token });
    return new Response(null, { status: 204 });
  } catch (e) {
    // 이미 저장됨(409)은 원하는 상태이므로 성공으로 처리(멱등).
    if (e instanceof ApiError && e.status === 409) return new Response(null, { status: 204 });
    const reason = await classifyFailure(token, e);
    if (reason === 'unauthorized') return fail(401, 'unauthorized');
    if (reason === 'customer_required') return fail(403, 'customer_required');
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
    const reason = await classifyFailure(token, e);
    if (reason === 'unauthorized') return fail(401, 'unauthorized');
    if (reason === 'customer_required') return fail(403, 'customer_required');
    const status = e instanceof ApiError ? e.status : 500;
    return fail(status, e instanceof Error ? e.message : 'unsave failed');
  }
};
