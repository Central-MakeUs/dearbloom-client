import { apiGet, apiPost, apiPatch, apiPut, apiDelete, type RequestOptions } from './http';
import type { RegionCode } from './regions';
import type { ArtworkDetail, ArtworkListItem, FileType } from './artworks';

/**
 * 작가(Artist) API — 모두 로그인(작가) 필요. token 을 넘겨야 합니다.
 * 작품 등록/수정/삭제는 Artwork 태그(/api/artworks), 프로필/촬영정보는 Artist 태그(/api/artists/me).
 */

// ---- Types ----

export interface ArtistMe {
  artistId: number;
  nickname: string;
  intro: string;
  artistImageUrl: string | null;
  regionList: RegionCode[];
  travelFeeInfo: string | null;
  packageInfo: string | null;
}

/** 작품 등록/사진교체 시 넘기는 사진 1건 (업로드 완료된 fileUrl 참조) */
export interface ArtworkPhotoInput {
  fileUrl: string;
  fileType: FileType;
  universityId: number;
}

export interface CreateArtworkPayload {
  title: string;
  price: number;
  photoList: ArtworkPhotoInput[];
}

export interface UpdateArtworkPayload {
  title: string;
  price: number;
}

// ---- 작가 프로필 ----

export function getArtistMe(opts: RequestOptions): Promise<ArtistMe> {
  return apiGet<ArtistMe>('/api/artists/me', opts);
}

export function updateArtistNickname(nickname: string, opts: RequestOptions): Promise<void> {
  return apiPatch<void>('/api/artists/me/nickname', { nickname }, opts);
}

export function updateArtistIntro(intro: string, opts: RequestOptions): Promise<void> {
  return apiPatch<void>('/api/artists/me/intro', { intro }, opts);
}

export function updateArtistImage(artistImageUrl: string, opts: RequestOptions): Promise<void> {
  return apiPatch<void>('/api/artists/me/image', { artistImageUrl }, opts);
}

export function updateArtistRegions(regionList: RegionCode[], opts: RequestOptions): Promise<void> {
  return apiPut<void>('/api/artists/me/regions', { regionList }, opts);
}

/** 촬영 정보(출장비/패키지) — 둘 다 자유 텍스트 */
export function updateArtistPricing(
  payload: { travelFeeInfo: string; packageInfo: string },
  opts: RequestOptions,
): Promise<void> {
  return apiPatch<void>('/api/artists/me/pricing', payload, opts);
}

export function deleteArtistTravelFee(opts: RequestOptions): Promise<void> {
  return apiDelete<void>('/api/artists/me/pricing/travel-fee', undefined, opts);
}

export function deleteArtistPackage(opts: RequestOptions): Promise<void> {
  return apiDelete<void>('/api/artists/me/pricing/package', undefined, opts);
}

// ---- 작가 본인 작품 ----

export function getMyArtworks(opts: RequestOptions): Promise<ArtworkListItem[]> {
  return apiGet<ArtworkListItem[]>('/api/artists/me/artworks', opts);
}

export function getMyArtwork(artworkId: number | string, opts: RequestOptions): Promise<ArtworkDetail> {
  return apiGet<ArtworkDetail>(`/api/artists/me/artworks/${artworkId}`, opts);
}

// ---- 작품 CRUD (Artwork 태그) ----

/** 작품 등록. 사진은 먼저 업로드해 fileUrl 을 확보한 뒤 photoList 로 전달. 생성된 artworkId 반환(추정). */
export function createArtwork(payload: CreateArtworkPayload, opts: RequestOptions): Promise<{ artworkId: number }> {
  return apiPost<{ artworkId: number }>('/api/artworks', payload, opts);
}

/** 작품 기본 정보(제목/가격) 수정 */
export function updateArtwork(
  artworkId: number | string,
  payload: UpdateArtworkPayload,
  opts: RequestOptions,
): Promise<void> {
  return apiPatch<void>(`/api/artworks/${artworkId}`, payload, opts);
}

export function deleteArtwork(artworkId: number | string, opts: RequestOptions): Promise<void> {
  return apiDelete<void>(`/api/artworks/${artworkId}`, undefined, opts);
}

/** 작품 사진 전체 교체 */
export function replaceArtworkPhotos(
  artworkId: number | string,
  photoList: ArtworkPhotoInput[],
  opts: RequestOptions,
): Promise<void> {
  return apiPut<void>(`/api/artworks/${artworkId}/photos`, { photoList }, opts);
}
