import { apiGet, apiDelete, type RequestOptions } from './http';

/**
 * 회원(Member) API — 계정 단위 정보. 고객/작가 공용.
 * 로그인(accessToken) 필요. 프로필 상세(작가 소개·고객 학교 등)는 각 도메인 API 참고.
 */

export type MemberRole = 'CUSTOMER' | 'ARTIST';
export type SocialProvider = 'GOOGLE' | 'APPLE';

export interface MemberMe {
  memberId: number;
  email: string;
  name: string;
  /** 마지막으로 활성화한 역할. 역할 미선택(온보딩 전) 계정은 null */
  recentRole: MemberRole | null;
  /** 가입/로그인에 사용한 소셜 제공자. 미확정 시 null */
  recentSocialProvider: SocialProvider | null;
  /** 고객 프로필 보유 여부 */
  hasCustomer: boolean;
  /** 작가 프로필 보유 여부 */
  hasArtist: boolean;
}

/** 내 계정 정보 조회 */
export function getMemberMe(opts: RequestOptions): Promise<MemberMe> {
  return apiGet<MemberMe>('/api/members/me', opts);
}

/** 로그아웃 — 서버측 세션(refresh) 무효화. 쿠키 만료는 호출한 프론트가 별도로 처리. */
export function logoutMember(opts: RequestOptions): Promise<void> {
  return apiDelete<void>('/api/members/logout', undefined, opts);
}
