import { apiGet, apiPatch, type RequestOptions } from './http';
import type { RegionCode } from './regions';

/** 고객(Customer) 계정/프로필 API. */

export interface CustomerMe {
  customerId: number;
  name: string;
  universityId: number | null;
  universityName: string | null;
  /** 관심/활동 지역 (단일, 미설정 시 null) */
  region: RegionCode | null;
  /** 지역 한글 라벨 (미설정 시 null) */
  regionLabel: string | null;
}

/** 프로필 수정 payload. 미전송 필드는 미변경. */
export interface CustomerProfilePatch {
  name?: string;
  region?: RegionCode;
}

/** 고객 정보 조회 */
export function getCustomerMe(opts: RequestOptions): Promise<CustomerMe> {
  return apiGet<CustomerMe>('/api/customers/me', opts);
}

/** 고객 프로필(이름·지역) 수정. PATCH /api/customers/me */
export function updateCustomerProfile(patch: CustomerProfilePatch, opts: RequestOptions): Promise<void> {
  return apiPatch<void>('/api/customers/me', patch, opts);
}
