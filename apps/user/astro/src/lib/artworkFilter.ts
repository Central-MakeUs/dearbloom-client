/**
 * 작품 탐색 필터 — URL 쿼리스트링이 유일한 상태 저장소입니다.
 *
 * 필터 설정은 별도 페이지(/snaps/filter)라 페이지 이동을 건너뛰므로, 상태를 URL 에 두면
 * 뒤로가기·새로고침·공유가 전부 공짜로 따라옵니다. SSR 첫 페이지도 같은 값을 그대로 읽습니다.
 */

import {
  ARTWORK_DATE_RANGE_MAX_DAYS,
  ARTWORK_HEAD_COUNT_MAX,
  ARTIST_REGION_LABELS,
  artistRegionLabel,
  type ArtistRegionCode,
  type ArtworkListParams,
  type ArtworkSortOrder,
} from '@dearbloom/shared';

const SORT_ORDERS: ArtworkSortOrder[] = ['LATEST', 'PRICE_LOW', 'PRICE_HIGH'];

/** 정렬 칩/시트에 노출하는 라벨. LATEST 는 화면상 "추천순". */
export const SORT_OPTIONS: { value: ArtworkSortOrder; label: string }[] = [
  { value: 'LATEST', label: '추천순' },
  { value: 'PRICE_LOW', label: '낮은 가격순' },
  { value: 'PRICE_HIGH', label: '높은 가격순' },
];

export function sortLabel(sort: ArtworkSortOrder): string {
  return SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '추천순';
}

/** 'YYYY-MM-DD' 형식이면서 실제로 존재하는 날짜인지. (2026-02-31 같은 값을 걸러냅니다) */
function isValidDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y!, m! - 1, d!);
  return date.getFullYear() === y && date.getMonth() === m! - 1 && date.getDate() === d;
}

/** 두 날짜의 간격(일). 같은 날이면 0. */
export function daysBetween(start: string, end: string): number {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const ms = new Date(ey!, em! - 1, ed!).getTime() - new Date(sy!, sm! - 1, sd!).getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * URL 에서 필터를 읽습니다. 잘못된 값은 조용히 버립니다 —
 * 사용자가 주소를 직접 고쳐도 400 대신 필터 없는 목록이 나오는 편이 낫습니다.
 * 백엔드가 400 을 주는 조합(한쪽 날짜만, 역전, 30일 초과)도 여기서 미리 막습니다.
 */
export function parseFilterParams(url: URL): ArtworkListParams {
  const q = url.searchParams;
  const params: ArtworkListParams = {};

  const startDate = q.get('startDate');
  const endDate = q.get('endDate');
  if (isValidDate(startDate) && isValidDate(endDate)) {
    const gap = daysBetween(startDate, endDate);
    if (gap >= 0 && gap < ARTWORK_DATE_RANGE_MAX_DAYS) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
  }

  const region = q.get('region');
  if (region && region in ARTIST_REGION_LABELS) params.region = region as ArtistRegionCode;

  const headCount = Number(q.get('headCount'));
  if (Number.isInteger(headCount) && headCount >= 1 && headCount <= ARTWORK_HEAD_COUNT_MAX) {
    params.headCount = headCount;
  }

  const sort = q.get('sort');
  if (sort && SORT_ORDERS.includes(sort as ArtworkSortOrder)) params.sort = sort as ArtworkSortOrder;

  return params;
}

/** 목록 열 수. 2 가 기본이고, 격자 버튼으로 3 열(작게 보기)로 바꿉니다. */
export type ArtworkColumns = 2 | 3;

/**
 * 열 수는 보기 방식일 뿐 조회 조건이 아니라서 ArtworkListParams 와 분리합니다 —
 * 섞어두면 API 요청에 cols 가 딸려 나갑니다.
 */
export function parseColumns(url: URL): ArtworkColumns {
  return url.searchParams.get('cols') === '3' ? 3 : 2;
}

/**
 * 필터를 쿼리스트링으로. 빈 값은 넣지 않아 주소가 지저분해지지 않게 합니다.
 * cols 는 기본값(2)이면 생략합니다.
 */
export function toSearchParams(params: ArtworkListParams, cols?: ArtworkColumns): URLSearchParams {
  const q = new URLSearchParams();
  if (params.startDate && params.endDate) {
    q.set('startDate', params.startDate);
    q.set('endDate', params.endDate);
  }
  if (params.region) q.set('region', params.region);
  if (params.headCount !== undefined) q.set('headCount', String(params.headCount));
  if (params.sort && params.sort !== 'LATEST') q.set('sort', params.sort);
  if (cols === 3) q.set('cols', '3');
  return q;
}

/** '?a=b' 또는 '' — 링크에 바로 이어붙일 수 있는 형태. */
export function toQueryString(params: ArtworkListParams, cols?: ArtworkColumns): string {
  const q = toSearchParams(params, cols);
  return q.size > 0 ? `?${q}` : '';
}

/** '8.11' — 필터 칩에 넣는 짧은 날짜. */
function chipDate(date: string): string {
  const [, m, d] = date.split('-');
  return `${Number(m)}.${Number(d)}`;
}

/**
 * 필터 칩 라벨. 선택하지 않았으면 필터 이름("날짜"), 선택했으면 그 값을 보여줍니다.
 * 지역·인원이 단일 선택이라 개수("지역 1")보다 값("서울")이 화면에서 훨씬 쓸모 있습니다.
 */
export function filterChipLabels(params: ArtworkListParams): {
  date: string;
  region: string;
  headCount: string;
} {
  const date =
    params.startDate && params.endDate
      ? params.startDate === params.endDate
        ? chipDate(params.startDate)
        : `${chipDate(params.startDate)}~${chipDate(params.endDate)}`
      : '날짜';

  const headCount =
    params.headCount === undefined
      ? '인원'
      : params.headCount >= ARTWORK_HEAD_COUNT_MAX
        ? `${ARTWORK_HEAD_COUNT_MAX}인 이상`
        : `${params.headCount}인`;

  return {
    date,
    region: params.region ? artistRegionLabel(params.region) : '지역',
    headCount,
  };
}

/** 필터(정렬 제외)가 하나라도 걸려 있는지 — 칩 활성 표시와 초기화 버튼 노출에 씁니다. */
export function hasActiveFilter(params: ArtworkListParams): boolean {
  return Boolean(params.startDate || params.region || params.headCount !== undefined);
}
