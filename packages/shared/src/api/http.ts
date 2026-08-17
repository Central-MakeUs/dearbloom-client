/**
 * DearBloom API — 공통 HTTP 래퍼.
 *
 * axios 대신 네이티브 fetch 사용: astro(SSR/Node), next(server/client), RN 모두 동일하게 동작하고
 * 별도 의존성이 없습니다. 인증이 필요한 호출은 `token`(accessToken)을 넘기면 Bearer 로 붙습니다.
 * accessToken 은 프론트의 httpOnly 쿠키에 있으므로, 서버(astro/next)에서 쿠키를 읽어 token 으로 전달하세요.
 */

/** 런타임 env (Node: next/astro 서버). 브라우저 island 에서는 undefined → 기본 URL 폴백. */
const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const API_BASE_URL =
  runtimeEnv.NEXT_PUBLIC_API_URL ??
  runtimeEnv.PUBLIC_API_URL ??
  'https://dev-api.dearbloom.co.kr';

/** 백엔드 공통 응답 봉투. 성공 시 data, 실패 시 error. */
interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  /** accessToken. 있으면 Authorization: Bearer 로 첨부. */
  token?: string;
  signal?: AbortSignal;
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

async function request<T>(method: Method, path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: opts?.signal,
    cache: 'no-store',
  });

  const text = await res.text();
  const json: ApiEnvelope<T> = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(res.status, json.error?.code, json.error?.message ?? res.statusText);
  }
  // 목록/상세는 { data } 봉투, 일부는 봉투 없이 바로 반환될 수 있어 둘 다 대응.
  return (json.data !== undefined ? json.data : (json as unknown)) as T;
}

/**
 * public(비로그인 가능) 엔드포인트용 인증 폴백.
 * token 으로 시도 → 401(만료/무효 accessToken)이면 토큰 없이 익명으로 1회 재시도.
 * 반환의 tokenExpired=true 면 호출측(SSR)에서 만료된 accessToken 쿠키를 정리하세요.
 *
 * NOTE: 백엔드 재발급(reissue) 엔드포인트가 생기면, 401 캐치 시 익명 재시도 '앞'에
 * refreshToken 재발급→새 토큰으로 재시도를 끼워넣으면 isSaved 등 로그인 상태를 보존할 수 있습니다.
 */
export async function fetchPublicWithAuthFallback<T>(
  fetcher: (opts?: RequestOptions) => Promise<T>,
  token?: string,
): Promise<{ data: T; tokenExpired: boolean }> {
  if (!token) return { data: await fetcher(), tokenExpired: false };
  try {
    return { data: await fetcher({ token }), tokenExpired: false };
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      // 만료/무효 토큰 → 익명으로 재시도(public 엔드포인트이므로 콘텐츠는 정상 노출)
      return { data: await fetcher(), tokenExpired: true };
    }
    throw e;
  }
}

export const apiGet = <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, undefined, opts);
export const apiPost = <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('POST', path, body, opts);
export const apiPatch = <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PATCH', path, body, opts);
export const apiPut = <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('PUT', path, body, opts);
export const apiDelete = <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>('DELETE', path, body, opts);
