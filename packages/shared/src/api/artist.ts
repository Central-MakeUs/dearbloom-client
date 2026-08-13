import { apiGet, apiPost, apiPatch, apiPut, apiDelete, type RequestOptions } from './http';
import type { ArtistRegionCode } from './regions';
import type { ArtworkDetail, FileType } from './artworks';

/**
 * 작가(Artist) API — 모두 로그인(작가) 필요. token 을 넘겨야 합니다.
 * 작품 등록/수정/삭제는 Artwork 태그(/api/artworks), 프로필/촬영정보는 Artist 태그(/api/artists/me).
 */

// ---- Types ----

export interface ArtistMe {
  artistId: number;
  nickname: string;
  intro: string;
  /** 조회는 imageUrl, 수정은 artistImageUrl 로 백엔드 필드명이 다름에 유의. */
  imageUrl: string | null;
  regionList: ArtistRegionCode[];
  /** 작가 기타 안내(우천 정책 등) */
  etcInfo: string | null;
}

/** 작품 등록/사진교체 시 넘기는 사진 1건 (업로드 완료된 fileUrl 참조) */
export interface ArtworkPhotoInput {
  fileUrl: string;
  fileType: FileType;
  /** 사진별 촬영 학교(선택). 미지정 시 null. */
  universityId: number | null;
}

/** 작품 등록·패키지 교체 시 넘기는 촬영 패키지 1건. 필수는 packageName·price 뿐, 나머지는 미정이면 null. */
export interface ArtworkPackageInput {
  packageName: string;
  price: number;
  /** 촬영 시간(분). 미정이면 null. */
  durationMinutes: number | null;
  /** 보정본 수. 미정이면 null. */
  finalPhotoCount: number | null;
  /** 추가 정보(자유 텍스트). 없으면 null. */
  extraInfo: string | null;
}

export interface CreateArtworkPayload {
  title: string;
  /** 작품 설명(선택) */
  description?: string | null;
  /** 촬영 인원(min~max). 백엔드 필수. */
  minHeadCount: number;
  maxHeadCount: number;
  photoList: ArtworkPhotoInput[];
  /** 촬영 패키지 목록. 1개 이상 필수. */
  packageList: ArtworkPackageInput[];
}

/** 작품 기본 정보 수정. title·description 모두 선택(미전송/null=미변경, description=''=설명 비움). */
export interface UpdateArtworkPayload {
  title?: string;
  description?: string;
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

export function updateArtistRegions(regionList: ArtistRegionCode[], opts: RequestOptions): Promise<void> {
  return apiPut<void>('/api/artists/me/regions', { regionList }, opts);
}

/** 작가 기타 안내(우천 정책 등) 수정. (기존 출장비/패키지는 작품 패키지로 이동됨) */
export function updateArtistEtcInfo(etcInfo: string, opts: RequestOptions): Promise<void> {
  return apiPatch<void>('/api/artists/me/etc-info', { etcInfo }, opts);
}

// ---- 작가 본인 작품 ----

/**
 * GET /api/artists/me/artworks 목록 아이템. 공개 목록(ArtworkListItem)과 달리
 * `price`(단일 대표가), `savedCount`/`viewCount`(작가 통계)를 주며 `isSaved`가 없음.
 */
export interface MyArtworkListItem {
  artworkId: number;
  title: string;
  price: number;
  minHeadCount: number | null;
  maxHeadCount: number | null;
  artistNickname: string;
  artistRegionList: ArtistRegionCode[];
  thumbnailUrl: string;
  /** 저장(찜)된 횟수 */
  savedCount: number;
  /** 조회수 */
  viewCount: number;
}

export function getMyArtworks(opts: RequestOptions): Promise<MyArtworkListItem[]> {
  return apiGet<MyArtworkListItem[]>('/api/artists/me/artworks', opts);
}

export function getMyArtwork(artworkId: number | string, opts: RequestOptions): Promise<ArtworkDetail> {
  return apiGet<ArtworkDetail>(`/api/artists/me/artworks/${artworkId}`, opts);
}

// ---- 작품 CRUD (Artwork 태그) ----

/** 작품 등록. 사진은 먼저 업로드해 fileUrl 을 확보한 뒤 photoList 로 전달. 생성된 artworkId 반환(추정). */
export function createArtwork(payload: CreateArtworkPayload, opts: RequestOptions): Promise<{ artworkId: number }> {
  return apiPost<{ artworkId: number }>('/api/artworks', payload, opts);
}

/** 작품 기본 정보(작품명·설명) 수정. PATCH /api/artworks/{id} */
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

/**
 * 작품 패키지 전체 교체. PUT /api/artworks/{id}/packages
 *
 * 부분 수정이 아니라 **전체 교체**입니다. 유지할 패키지도 함께 보내야 하며, 1개 이상 필수입니다.
 * 리스트 화면의 최저가는 이 목록 기준으로 자동 갱신됩니다.
 * 이미 들어온 문의·예약은 문의 시점의 패키지 스냅샷을 쓰므로 영향을 받지 않습니다.
 */
export function updateArtworkPackages(
  artworkId: number | string,
  packageList: ArtworkPackageInput[],
  opts: RequestOptions,
): Promise<void> {
  return apiPut<void>(`/api/artworks/${artworkId}/packages`, { packageList }, opts);
}

/** 작품 사진 전체 교체 */
export function replaceArtworkPhotos(
  artworkId: number | string,
  photoList: ArtworkPhotoInput[],
  opts: RequestOptions,
): Promise<void> {
  return apiPut<void>(`/api/artworks/${artworkId}/photos`, { photoList }, opts);
}
