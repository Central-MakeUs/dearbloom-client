import { apiGet, apiPost, type RequestOptions } from './http';

/**
 * 신고(Report) API — 작품 신고. 고객(Customer) 전용이라 모두 로그인 필요.
 * 신고는 작품 단위 1회성이며 취소가 없습니다(같은 작품 재신고 시 409).
 */

/** 신고 사유 최대 길이(백엔드 제약). */
export const ARTWORK_REPORT_CONTENT_MAX = 1000;

export interface ArtworkReported {
  artworkId: number;
  /** 내가 이 작품을 신고했는지 여부 */
  reported: boolean;
}

/** 작품 신고 여부 조회 — '신고하기' 진입점의 활성/비활성 판단용 */
export function getArtworkReported(artworkId: number | string, opts: RequestOptions): Promise<ArtworkReported> {
  return apiGet<ArtworkReported>(`/api/customers/me/artwork-reports/${artworkId}`, opts);
}

/** 작품 신고 — content 는 자유 텍스트(필수, 최대 1000자) */
export function reportArtwork(artworkId: number, content: string, opts: RequestOptions): Promise<void> {
  return apiPost<void>('/api/customers/me/artwork-reports', { artworkId, content }, opts);
}
