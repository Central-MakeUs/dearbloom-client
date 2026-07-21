import { apiGet, apiPost, apiDelete, type RequestOptions } from './http';
import type { ArtworkListItem } from './artworks';

/**
 * 저장(찜) API — 모두 로그인 필요.
 * accessToken 을 RequestOptions.token 으로 넘겨야 합니다(서버에서 httpOnly 쿠키를 읽어 전달).
 */

/** 내 저장 목록 */
export function getSavedArtworks(opts: RequestOptions): Promise<ArtworkListItem[]> {
  return apiGet<ArtworkListItem[]>('/api/customers/me/saved-artworks', opts);
}

/** 작품 저장 */
export function saveArtwork(artworkId: number, opts: RequestOptions): Promise<void> {
  return apiPost<void>('/api/customers/me/saved-artworks', { artworkId }, opts);
}

/** 작품 저장 취소 (단일) */
export function unsaveArtwork(artworkId: number, opts: RequestOptions): Promise<void> {
  return apiDelete<void>(`/api/customers/me/saved-artworks/${artworkId}`, undefined, opts);
}

/** 작품 저장 취소 (다중) */
export function unsaveArtworks(artworkIdList: number[], opts: RequestOptions): Promise<void> {
  return apiDelete<void>('/api/customers/me/saved-artworks', { artworkIdList }, opts);
}
