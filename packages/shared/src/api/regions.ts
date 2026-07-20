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
