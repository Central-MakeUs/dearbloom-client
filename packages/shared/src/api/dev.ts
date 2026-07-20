import { apiGet, apiPost } from './http';

/**
 * 개발용(Dev) 엔드포인트 — 개발 서버에서만 존재.
 * 소셜 로그인 없이 테스트 계정으로 로그인하기 위한 용도.
 */

export interface DevAccount {
  /** 개발 계정은 음수 id */
  memberId: number;
  name: string;
  email: string;
  hasCustomer: boolean;
  hasArtist: boolean;
}

export interface DevTokens {
  accessToken: string;
  refreshToken: string;
}

/** 테스트 계정 목록 */
export function getDevAccounts(): Promise<DevAccount[]> {
  return apiGet<DevAccount[]>('/dev/member/accounts');
}

/** 테스트 계정으로 로그인 → accessToken/refreshToken 반환 */
export function devLogin(memberId: number): Promise<DevTokens> {
  return apiPost<DevTokens>(`/dev/member/login/${memberId}`);
}
