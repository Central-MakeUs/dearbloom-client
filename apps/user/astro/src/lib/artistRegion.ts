const MAX_EXPLORE_REGION_TAGS = 2;

/** 탐색 지역 칩: 선택 지역 우선, 최대 2개와 숨김 수로 요약합니다. */
export function summarizeExploreRegions<T extends string>(
  regions: readonly T[] | undefined,
  selectedRegion?: T,
): { shownRegions: readonly T[]; hiddenRegionCount: number } {
  const source = regions ?? [];
  const selectedIndex = selectedRegion ? source.indexOf(selectedRegion) : -1;
  const ordered =
    selectedIndex > 0
      ? [selectedRegion!, ...source.slice(0, selectedIndex), ...source.slice(selectedIndex + 1)]
      : source;

  return {
    shownRegions: ordered.slice(0, MAX_EXPLORE_REGION_TAGS),
    hiddenRegionCount: Math.max(ordered.length - MAX_EXPLORE_REGION_TAGS, 0),
  };
}
