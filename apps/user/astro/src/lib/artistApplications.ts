import { timingSafeEqual } from 'node:crypto';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * 작가 사전등록(/for-artists) 저장소 — Vercel Storage(Marketplace)의 Neon Postgres.
 * 우리 API 서버를 거치지 않고 Vercel 함수에서 바로 저장한다(백엔드 로그인 없음).
 *
 * 필요한 환경변수 (Vercel 대시보드 → dearbloom-astro → Settings → Environment Variables)
 * - DATABASE_URL: Storage 탭에서 Neon 을 연결하면 자동으로 들어온다.
 * - ARTIST_APPLY_ADMIN_PASSWORD: 관리 화면(/for-artists/admin) 비밀번호. 12자 이상.
 *
 * 테이블은 첫 요청 때 `create table if not exists` 로 만든다(마이그레이션 도구 없음).
 */

export const APPLICATION_STATUSES = ['new', 'contacted', 'joined', 'rejected'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: '신규',
  contacted: '연락함',
  joined: '가입 완료',
  rejected: '제외',
};

export interface ApplicationInput {
  name: string;
  instagram: string | null;
  phone: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  userAgent: string | null;
}

export interface ApplicationRow {
  id: string;
  name: string;
  instagram: string | null;
  phone: string;
  status: ApplicationStatus;
  memo: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  consent_at: string;
  created_at: string;
  updated_at: string;
}

const CREATE_TABLE = `
create table if not exists artist_applications (
  id bigserial primary key,
  name text not null,
  instagram text,
  phone text not null unique,
  status text not null default 'new',
  memo text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  user_agent text,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)`;

let tableReady: Promise<void> | null = null;

/** DB 가 연결되지 않았으면 null — 호출부는 503 으로 "준비 중"을 알린다. */
export function getSql(): NeonQueryFunction<false, false> | null {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  return url ? neon(url) : null;
}

export async function ensureTable(sql: NeonQueryFunction<false, false>) {
  tableReady ??= sql
    .query(CREATE_TABLE)
    .then(() => undefined)
    .catch((error: unknown) => {
      tableReady = null; // 다음 요청에서 다시 시도
      throw error;
    });
  await tableReady;
}

// ---- 입력 검증 ----

function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed || null;
}

/** 하이픈·공백을 뺀 휴대폰 번호(010xxxxxxxx). 형식이 아니면 null */
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const digits = value.replace(/\D/g, '');
  return /^01\d{8,9}$/.test(digits) ? digits : null;
}

export function normalizeInstagram(value: unknown): string | null {
  const raw = text(value, 80);
  if (!raw) return null;
  // 프로필 URL 을 붙여 넣어도 계정명만 남긴다.
  const handle = raw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0];
  return handle ? handle.slice(0, 30) : null;
}

export type ParseResult =
  | { ok: true; value: Omit<ApplicationInput, 'userAgent'> }
  | { ok: false; field: 'name' | 'phone' | 'consent'; message: string };

export function parseApplication(body: Record<string, unknown>): ParseResult {
  const name = text(body.name, 40);
  if (!name) return { ok: false, field: 'name', message: '작가명을 입력해 주세요.' };

  const phone = normalizePhone(body.phone);
  if (!phone) {
    return { ok: false, field: 'phone', message: '휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요.' };
  }

  if (body.consent !== true) {
    return { ok: false, field: 'consent', message: '개인정보 수집·이용에 동의해 주세요.' };
  }

  return {
    ok: true,
    value: {
      name,
      phone,
      instagram: normalizeInstagram(body.instagram),
      utmSource: text(body.utm_source, 100),
      utmMedium: text(body.utm_medium, 100),
      utmCampaign: text(body.utm_campaign, 100),
      referrer: text(body.referrer, 500),
    },
  };
}

// ---- 요청 제한 (서버리스 인스턴스마다 따로 — 대량 스팸만 거르는 최소 장치) ----

export function makeLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5_000) hits.clear();
    return true;
  };
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

// ---- 관리자 인증 ----

const MIN_ADMIN_PASSWORD_LENGTH = 12;

export type AdminAuth = 'ok' | 'unconfigured' | 'denied';

export function checkAdmin(request: Request): AdminAuth {
  const password = process.env.ARTIST_APPLY_ADMIN_PASSWORD ?? '';
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) return 'unconfigured';

  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const given = Buffer.from(token);
  const expected = Buffer.from(password);
  return given.length === expected.length && timingSafeEqual(given, expected) ? 'ok' : 'denied';
}

export function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

// ---- CSV ----

/** 엑셀이 수식으로 읽지 않게 =,+,-,@ 로 시작하는 값 앞에 ' 를 붙인다. */
function csvCell(value: unknown): string {
  let cell = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(cell)) cell = `'${cell}`;
  return `"${cell.replace(/"/g, '""')}"`;
}

const BOM = String.fromCharCode(0xfeff);

export function toCsv(rows: ApplicationRow[]): string {
  const header = ['신청일', '작가명', '인스타그램', '휴대폰', '상태', '메모', 'utm_source', 'utm_campaign'];
  const lines = rows.map((row) =>
    [
      row.created_at,
      row.name,
      row.instagram,
      row.phone,
      STATUS_LABELS[row.status] ?? row.status,
      row.memo,
      row.utm_source,
      row.utm_campaign,
    ]
      .map(csvCell)
      .join(','),
  );
  // BOM — 엑셀에서 한글이 깨지지 않게
  return `${BOM}${[header.map(csvCell).join(','), ...lines].join('\r\n')}\r\n`;
}
