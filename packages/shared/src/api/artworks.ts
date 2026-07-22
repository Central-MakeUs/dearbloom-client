import { apiGet, type RequestOptions } from './http';
import type { RegionCode } from './regions';

// ---- Types ----

export type FileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

/** GET /api/artworks 목록 아이템 */
export interface ArtworkListItem {
  artworkId: number;
  title: string;
  /** 패키지 중 최저가 */
  lowestPrice: number;
  /** 인원 범위 (min~max) */
  minHeadCount: number;
  maxHeadCount: number;
  artistNickname: string;
  artistRegionList: RegionCode[];
  thumbnailUrl: string;
  /** 비로그인 시 null */
  isSaved: boolean | null;
}

/** 촬영 패키지 (작품 귀속). 가격/시간/보정 장수 포함. */
export interface ArtworkPackage {
  artworkPackageId: number;
  packageName: string;
  price: number;
  durationMinutes: number;
  finalPhotoCount: number;
  extraInfo: string | null;
}

export interface ArtworkPhoto {
  portfolioFileId: number;
  fileUrl: string;
  fileType: FileType;
  universityId: number;
  universityName: string;
  sortOrder: number;
}

export interface ArtworkArtist {
  artistId: number;
  nickname: string;
  intro: string;
  regionList: RegionCode[];
}

export interface OtherArtwork {
  artworkId: number;
  imageUrl: string;
}

/** GET /api/artworks/{id} 상세 */
export interface ArtworkDetail {
  artworkId: number;
  title: string;
  /** 인원 범위 (min~max) */
  minHeadCount: number;
  maxHeadCount: number;
  photoList: ArtworkPhoto[];
  schoolNameList: string[];
  /** 촬영 구성 = 패키지 목록 (기존 price/travelFeeInfo/packageInfo 대체) */
  packageList: ArtworkPackage[];
  artist: ArtworkArtist;
  otherArtworkList: OtherArtwork[];
  isSaved: boolean | null;
}

// ---- HTTP calls (public, 비로그인/고객) ----

/** 작품 리스트 (전체, 최신순). 필터/정렬/페이지네이션 파라미터는 백엔드 미지원. */
export function getArtworks(opts?: RequestOptions): Promise<ArtworkListItem[]> {
  return apiGet<ArtworkListItem[]>('/api/artworks', opts);
}

/** 작품 상세 (비로그인/고객). token 을 넘기면 isSaved 가 채워짐. */
export function getArtwork(artworkId: number | string, opts?: RequestOptions): Promise<ArtworkDetail> {
  return apiGet<ArtworkDetail>(`/api/artworks/${artworkId}`, opts);
}
