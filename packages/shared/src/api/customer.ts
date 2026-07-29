import { apiGet, apiPatch, type RequestOptions } from './http';
import type { ArtistRegionCode } from './regions';

/** 고객(Customer) 계정/프로필 API. */

export interface CustomerMe {
  customerId: number;
  name: string;
  universityId: number | null;
  universityName: string | null;
  /**
   * 관심/활동 지역 (단일, 미설정 시 null).
   * 백엔드는 광역이 아니라 작가와 동일한 세분화 지역 enum(경기북부/경기남부, 대전·세종 통합)을 사용한다.
   */
  region: ArtistRegionCode | null;
  /** 지역 한글 라벨 (미설정 시 null) */
  regionLabel: string | null;
}

/** 프로필 수정 payload. 미전송 필드는 미변경, region: null 은 지역 해제. */
export interface CustomerProfilePatch {
  name?: string;
  region?: ArtistRegionCode | null;
}

/** 고객 정보 조회 */
export function getCustomerMe(opts: RequestOptions): Promise<CustomerMe> {
  return apiGet<CustomerMe>('/api/customers/me', opts);
}

/** 고객 프로필(이름·지역) 수정. PATCH /api/customers/me */
export function updateCustomerProfile(patch: CustomerProfilePatch, opts: RequestOptions): Promise<void> {
  return apiPatch<void>('/api/customers/me', patch, opts);
}
