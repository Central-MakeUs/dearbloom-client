export const prerender = false;

import type { APIRoute } from 'astro';
import {
  APPLICATION_STATUSES,
  checkAdmin,
  clientIp,
  ensureTable,
  getSql,
  json,
  makeLimiter,
  toCsv,
  type ApplicationRow,
  type ApplicationStatus,
} from '@/lib/artistApplications';

/**
 * 작가 사전등록 관리 API — /for-artists/admin 화면이 쓴다.
 * 인증: Authorization: Bearer <ARTIST_APPLY_ADMIN_PASSWORD>
 *
 * GET    ?status=&q=&format=csv  목록(최근 순, 최대 1,000건) 또는 CSV
 * PATCH  { id, status?, memo? }   상태·메모 수정
 * DELETE ?id=                     삭제(개인정보 삭제 요청 대응)
 */

const failedLogin = makeLimiter(8, 15 * 60 * 1000); // IP 당 15분에 8번 틀리면 잠시 막는다

function isStatus(value: unknown): value is ApplicationStatus {
  return typeof value === 'string' && (APPLICATION_STATUSES as readonly string[]).includes(value);
}

async function guard(request: Request) {
  const auth = checkAdmin(request);
  if (auth === 'unconfigured') {
    return { error: json(503, { error: '관리자 비밀번호(ARTIST_APPLY_ADMIN_PASSWORD)가 설정되지 않았어요.' }) };
  }
  if (auth === 'denied') {
    if (!failedLogin(clientIp(request))) {
      return { error: json(429, { error: '여러 번 틀렸어요. 15분 뒤 다시 시도해 주세요.' }) };
    }
    return { error: json(401, { error: '비밀번호가 맞지 않아요.' }) };
  }
  const sql = getSql();
  if (!sql) return { error: json(503, { error: 'DB(DATABASE_URL)가 연결되지 않았어요.' }) };
  await ensureTable(sql);
  return { sql };
}

export const GET: APIRoute = async ({ request, url }) => {
  const { sql, error } = await guard(request);
  if (error) return error;

  const status = url.searchParams.get('status');
  const q = url.searchParams.get('q')?.trim() ?? '';
  const statusFilter = isStatus(status) ? status : null;
  const like = q ? `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%` : null;

  const rows = (await sql`
    select id::text, name, instagram, phone, status, memo, utm_source, utm_medium, utm_campaign,
           referrer, consent_at, created_at, updated_at
    from artist_applications
    where (${statusFilter}::text is null or status = ${statusFilter})
      and (${like}::text is null or name ilike ${like} or instagram ilike ${like} or phone like ${like})
    order by created_at desc
    limit 1000
  `) as ApplicationRow[];

  if (url.searchParams.get('format') === 'csv') {
    const date = new Date().toISOString().slice(0, 10);
    return new Response(toCsv(rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="artist-applications-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  const counts = (await sql`
    select status, count(*)::int as count from artist_applications group by status
  `) as { status: ApplicationStatus; count: number }[];

  return json(200, { rows, counts });
};

export const PATCH: APIRoute = async ({ request }) => {
  const { sql, error } = await guard(request);
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { error: '요청 형식이 올바르지 않아요.' });
  }

  const id = typeof body.id === 'string' || typeof body.id === 'number' ? String(body.id) : '';
  if (!/^\d+$/.test(id)) return json(400, { error: 'id 가 필요해요.' });
  if (body.status !== undefined && !isStatus(body.status)) return json(400, { error: '상태 값이 올바르지 않아요.' });
  if (body.memo !== undefined && typeof body.memo !== 'string') return json(400, { error: '메모 형식이 올바르지 않아요.' });

  const status = isStatus(body.status) ? body.status : null;
  const memo = typeof body.memo === 'string' ? body.memo.slice(0, 1000) : null;

  const updated = await sql`
    update artist_applications set
      status = coalesce(${status}, status),
      memo = case when ${memo !== null} then ${memo} else memo end,
      updated_at = now()
    where id = ${id}::bigint
    returning id
  `;
  if (updated.length === 0) return json(404, { error: '신청을 찾을 수 없어요.' });
  return json(200, { ok: true });
};

export const DELETE: APIRoute = async ({ request, url }) => {
  const { sql, error } = await guard(request);
  if (error) return error;

  const id = url.searchParams.get('id') ?? '';
  if (!/^\d+$/.test(id)) return json(400, { error: 'id 가 필요해요.' });

  const deleted = await sql`delete from artist_applications where id = ${id}::bigint returning id`;
  if (deleted.length === 0) return json(404, { error: '신청을 찾을 수 없어요.' });
  return json(200, { ok: true });
};
