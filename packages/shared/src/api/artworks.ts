import { apiGet, type RequestOptions } from './http';
import type { ArtistRegionCode, RegionCode } from './regions';

// ---- Types ----

export type FileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

/** GET /api/artworks 목록 아이템 */
export interface ArtworkListItem {
  artworkId: number;
  title: string;
  /** 패키지 중 최저가 */
  lowestPrice: number;
  /** 촬영 인원 (min~max). maxHeadCount 가 null 이면 min 이상(상한 없음) */
  minHeadCount: number;
  maxHeadCount: number | null;
  artistNickname: string;
  artistRegionList: ArtistRegionCode[];
  thumbnailUrl: string;
  /**
   * 작품 사진 URL 목록(상세와 같은 sortOrder). 리스트뷰의 가로 스크롤용입니다.
   * 상세의 photoList 는 객체 배열이지만 목록은 URL 문자열만 내려옵니다.
   */
  photoList?: string[];
  /** 비로그인 시 null */
  isSaved: boolean | null;
}

/** 작품 목록 정렬. 가격 정렬은 카드에 노출되는 가격(패키지 중 최저가) 기준. */
export type ArtworkSortOrder =
  | 'LATEST' // 기본순 = 등록 최신순 (화면의 "추천순")
  | 'PRICE_LOW' // 낮은 가격순
  | 'PRICE_HIGH'; // 높은 가격순

/** 작품 탐색 목록의 필터·정렬·커서 파라미터. 모두 선택이고, 넘기지 않은 조건은 적용되지 않습니다. */
export interface ArtworkListParams {
  /** 촬영 희망 기간 시작일(yyyy-MM-dd). endDate 와 항상 함께 보냅니다. */
  startDate?: string;
  /** 종료일(yyyy-MM-dd). 하루만 고를 땐 startDate 와 같은 날. startDate 로부터 최대 30일. */
  endDate?: string;
  /** 촬영 지역. 작가 활동 지역에 이 지역이 포함된 작품만. */
  region?: ArtistRegionCode;
  /** 촬영 희망 인원 1~6. 6 은 화면의 "6인 이상". */
  headCount?: number;
  /** 안 넘기면 LATEST */
  sort?: ArtworkSortOrder;
  /** 첫 페이지는 비우고, 이후엔 직전 응답의 nextCursor 를 그대로 넘깁니다. */
  cursor?: string;
  /** 페이지 크기. ARTWORK_PAGE_SIZE 범위 안이어야 합니다. */
  size?: number;
}

/** GET /api/artworks 한 페이지. 무한스크롤은 nextCursor 를 다음 요청에 그대로 실어 이어갑니다. */
export interface ArtworkPage {
  artworkList: ArtworkListItem[];
  /** 같은 필터를 만족하는 전체 작품 수(현재 페이지 크기와 무관). 상단 "전체 N" 용. */
  totalCount: number;
  /** hasNext 가 false 면 null */
  nextCursor: string | null;
  hasNext: boolean;
}

/** 백엔드 size 검증 범위(@Min/@Max)와 기본값. 벗어나면 VALIDATION-400. */
export const ARTWORK_PAGE_SIZE = { MIN: 4, MAX: 40, DEFAULT: 16 } as const;

/** 인원 필터 상한. 이 값은 화면에서 "N인 이상"으로 표기합니다. */
export const ARTWORK_HEAD_COUNT_MAX = 6;

/** 날짜 필터에서 startDate ~ endDate 로 고를 수 있는 최대 일수. */
export const ARTWORK_DATE_RANGE_MAX_DAYS = 30;

export interface ArtworkPhoto {
  portfolioFileId: number;
  fileUrl: string;
  fileType: FileType;
  /** 학교 미지정 사진이면 null */
  universityId: number | null;
  /** 학교 미지정 사진이면 null */
  universityName: string | null;
  sortOrder: number;
}

export interface ArtworkArtist {
  artistId: number;
  nickname: string;
  /** 작가 소개. 미등록 시 null */
  intro: string | null;
  regionList: RegionCode[];
  /** 작가 출장비 안내(자유 텍스트). 미등록 시 null */
  travelFee?: string | null;
}

export interface OtherArtwork {
  artworkId: number;
  title?: string;
  artistNickname?: string;
  imageUrl: string;
}

/** 촬영 패키지 (가격/구성) */
export interface ArtworkPackage {
  artworkPackageId: number;
  packageName: string;
  price: number;
  durationMinutes: number;
  finalPhotoCount: number;
  extraInfo: string | null;
}

/** GET /api/artworks/{id} 상세 */
export interface ArtworkDetail {
  artworkId: number;
  title: string;
  /** 작품 설명(자유 텍스트). 미등록 시 null */
  description: string | null;
  /** 촬영 인원 (min~max, max 는 null 가능) */
  minHeadCount: number | null;
  maxHeadCount: number | null;
  photoList: ArtworkPhoto[];
  schoolNameList: string[];
  /** 촬영 패키지 목록 (가격/촬영시간/보정본수 등) */
  packageList: ArtworkPackage[];
  artist: ArtworkArtist;
  /** 작가 연락 이메일 */
  artistEmail: string | null;
  otherArtworkList: OtherArtwork[];
  isSaved: boolean | null;
}

// ---- HTTP calls (public, 비로그인/고객) ----

/**
 * 작품 리스트 한 페이지 (필터·정렬·커서 무한스크롤).
 *
 * 응답 형태가 백엔드 배포 시점에 따라 다릅니다 — 구버전은 `ArtworkListItem[]`, 신버전은 `ArtworkPage`.
 * 개발서버(dev)만 먼저 신버전이 되는 기간이 있어 둘 다 받습니다. 배열이 오면 서버가 필터·정렬·커서를
 * 무시하고 전체를 내려준 것이므로 한 페이지로 접습니다(hasNext=false → 무한스크롤이 멈춤).
 * 백엔드 main 배포로 양쪽이 신버전이 되면 이 폴백은 지우세요.
 */
export async function getArtworkPage(params: ArtworkListParams = {}, opts?: RequestOptions): Promise<ArtworkPage> {
  const qs = new URLSearchParams();
  if (params.startDate && params.endDate) {
    qs.set('startDate', params.startDate);
    qs.set('endDate', params.endDate);
  }
  if (params.region) qs.set('region', params.region);
  if (params.headCount !== undefined) qs.set('headCount', String(params.headCount));
  if (params.sort) qs.set('sort', params.sort);
  if (params.cursor) qs.set('cursor', params.cursor);
  if (params.size !== undefined) qs.set('size', String(params.size));

  const query = qs.size > 0 ? `?${qs.toString()}` : '';
  const raw = await apiGet<ArtworkPage | ArtworkListItem[]>(`/api/artworks${query}`, opts);

  if (Array.isArray(raw)) {
    return { artworkList: raw, totalCount: raw.length, nextCursor: null, hasNext: false };
  }
  return raw;
}

/** 작품 상세 (비로그인/고객). token 을 넘기면 isSaved 가 채워짐. */
export function getArtwork(artworkId: number | string, opts?: RequestOptions): Promise<ArtworkDetail> {
  return apiGet<ArtworkDetail>(`/api/artworks/${artworkId}`, opts);
}
