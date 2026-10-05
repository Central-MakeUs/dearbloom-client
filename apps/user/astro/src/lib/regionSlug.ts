import { ARTIST_REGION_LABELS, type ArtistRegionCode } from '@dearbloom/shared';

/**
 * 지역 랜딩(/region/서울) URL 용 한글 slug. 검색 노출용이라 사람이 읽는 한글 표기를 그대로 쓰고,
 * 공백·'/' 만 '-' 로 바꿉니다 (경기 북부 → 경기-북부, 대전/세종 → 대전-세종).
 */
export function regionSlug(code: ArtistRegionCode): string {
  return ARTIST_REGION_LABELS[code].replace(/[\s/]+/g, '-');
}

export function regionPath(code: ArtistRegionCode): string {
  return `/region/${regionSlug(code)}`;
}

export const REGION_LINKS = (Object.keys(ARTIST_REGION_LABELS) as ArtistRegionCode[]).map((code) => ({
  code,
  label: ARTIST_REGION_LABELS[code],
  href: regionPath(code),
}));

/** slug → 코드. 퍼센트 인코딩된 채로 와도 받습니다. 없는 지역이면 undefined. */
export function regionCodeFromSlug(slug: string | undefined): ArtistRegionCode | undefined {
  if (!slug) return undefined;
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // 잘못된 인코딩이면 원문 그대로 비교
  }
  return REGION_LINKS.find((region) => regionSlug(region.code) === decoded)?.code;
}
