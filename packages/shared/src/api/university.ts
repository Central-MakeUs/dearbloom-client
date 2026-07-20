import { apiGet, type RequestOptions } from './http';

export interface University {
  universityId: number;
  name: string;
  campusType: string;
  region: string;
  address: string;
}

/** 대학교 검색 (prefix 자동완성) */
export function searchUniversities(keyword: string, limit = 10, opts?: RequestOptions): Promise<University[]> {
  const qs = new URLSearchParams({ keyword, limit: String(limit) });
  return apiGet<University[]>(`/api/universities/search?${qs.toString()}`, opts);
}
