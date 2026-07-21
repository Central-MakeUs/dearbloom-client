/** 백엔드 지역 enum (시/도) 코드 → 한글 표기. */
export const REGION_LABELS = {
  SEOUL: '서울',
  GYEONGGI: '경기',
  INCHEON: '인천',
  BUSAN: '부산',
  DAEGU: '대구',
  GWANGJU: '광주',
  DAEJEON: '대전',
  ULSAN: '울산',
  SEJONG: '세종',
  GANGWON: '강원',
  CHUNGBUK: '충북',
  CHUNGNAM: '충남',
  JEONBUK: '전북',
  JEONNAM: '전남',
  GYEONGBUK: '경북',
  GYEONGNAM: '경남',
  JEJU: '제주',
} as const;

export type RegionCode = keyof typeof REGION_LABELS;

/** 코드 → 한글. 미정의 코드는 코드 그대로 반환. */
export function regionLabel(code: string): string {
  return (REGION_LABELS as Record<string, string>)[code] ?? code;
}

/** 코드 배열 → "서울, 경기" 형태. */
export function regionLabels(codes: string[] | undefined | null): string {
  if (!codes?.length) return '';
  return codes.map(regionLabel).join(', ');
}

/** 셀렉트/칩 UI 용 옵션 목록. */
export const REGION_OPTIONS = Object.entries(REGION_LABELS).map(([value, label]) => ({
  value: value as RegionCode,
  label,
}));

/**
 * 작가 프로필/활동지역용 세분화 지역 enum (작품 목록의 광역 코드와 별개).
 * 예: 경기 → 경기북부/경기남부, 대전·세종 결합.
 */
export const ARTIST_REGION_LABELS = {
  SEOUL: '서울',
  GYEONGGI_NORTH: '경기북부',
  GYEONGGI_SOUTH: '경기남부',
  INCHEON: '인천',
  BUSAN: '부산',
  DAEGU: '대구',
  GWANGJU: '광주',
  DAEJEON_SEJONG: '대전·세종',
  ULSAN: '울산',
  GANGWON: '강원',
  CHUNGBUK: '충북',
  CHUNGNAM: '충남',
  JEONBUK: '전북',
  JEONNAM: '전남',
  GYEONGBUK: '경북',
  GYEONGNAM: '경남',
  JEJU: '제주',
} as const;

export type ArtistRegionCode = keyof typeof ARTIST_REGION_LABELS;

export function artistRegionLabel(code: string): string {
  return (ARTIST_REGION_LABELS as Record<string, string>)[code] ?? code;
}

export const ARTIST_REGION_OPTIONS = Object.entries(ARTIST_REGION_LABELS).map(([value, label]) => ({
  value: value as ArtistRegionCode,
  label,
}));
