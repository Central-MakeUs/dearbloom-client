export const prerender = false;

import type { APIRoute } from 'astro';
import {
  clientIp,
  ensureTable,
  getSql,
  json,
  makeLimiter,
  parseApplication,
} from '@/lib/artistApplications';

/** 작가 사전등록 접수 — /for-artists 폼이 호출한다. 같은 번호로 다시 신청하면 덮어쓴다. */

const limiter = makeLimiter(10, 10 * 60 * 1000); // IP 당 10분에 10회

export const POST: APIRoute = async ({ request }) => {
  if (!limiter(clientIp(request))) {
    return json(429, { error: '신청이 너무 많아요. 잠시 후 다시 시도해 주세요.' });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { error: '요청 형식이 올바르지 않아요.' });
  }

  // 사람에게는 보이지 않는 칸 — 값이 있으면 봇으로 보고 성공처럼 응답만 한다.
  if (typeof body.website === 'string' && body.website.trim()) return json(200, { ok: true });

  const parsed = parseApplication(body);
  if (!parsed.ok) return json(400, { error: parsed.message, field: parsed.field });

  const sql = getSql();
  if (!sql) {
    console.error('[artist-applications] DATABASE_URL 이 없습니다. Vercel Storage 에서 Neon 을 연결하세요.');
    return json(503, { error: '사전등록 접수를 준비하고 있어요. 잠시 후 다시 시도해 주세요.' });
  }

  const v = parsed.value;
  const userAgent = request.headers.get('user-agent')?.slice(0, 300) ?? null;
  try {
    await ensureTable(sql);
    await sql`
      insert into artist_applications
        (name, instagram, phone, utm_source, utm_medium, utm_campaign, referrer, user_agent, consent_at)
      values
        (${v.name}, ${v.instagram}, ${v.phone}, ${v.utmSource}, ${v.utmMedium}, ${v.utmCampaign}, ${v.referrer}, ${userAgent}, now())
      on conflict (phone) do update set
        name = excluded.name,
        instagram = coalesce(excluded.instagram, artist_applications.instagram),
        consent_at = now(),
        updated_at = now()
    `;
  } catch (error) {
    console.error('[artist-applications] 저장 실패', error);
    return json(500, { error: '저장하지 못했어요. 잠시 후 다시 시도해 주세요.' });
  }

  return json(200, { ok: true });
};
