import { apiGet, apiPatch, type RequestOptions } from './http';

/** 고객(Customer) 계정 정보 API. */

export interface CustomerMe {
  customerId: number;
  name: string;
  universityId: number | null;
  universityName: string | null;
}

/** 고객 정보 조회 */
export function getCustomerMe(opts: RequestOptions): Promise<CustomerMe> {
  return apiGet<CustomerMe>('/api/customers/me', opts);
}

/** 고객 이름 수정 */
export function updateCustomerName(name: string, opts: RequestOptions): Promise<void> {
  return apiPatch<void>('/api/customers/me/name', { name }, opts);
}
