import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeExploreRegions } from './artistRegion.ts';

test('탐색 지역은 선택 지역 우선으로 두 개만 보인다', () => {
  assert.deepEqual(summarizeExploreRegions([]), { shownRegions: [], hiddenRegionCount: 0 });
  assert.deepEqual(summarizeExploreRegions(['SEOUL']), { shownRegions: ['SEOUL'], hiddenRegionCount: 0 });
  assert.deepEqual(summarizeExploreRegions(['SEOUL', 'BUSAN']), {
    shownRegions: ['SEOUL', 'BUSAN'],
    hiddenRegionCount: 0,
  });
  assert.deepEqual(summarizeExploreRegions(['SEOUL', 'BUSAN', 'JEJU']), {
    shownRegions: ['SEOUL', 'BUSAN'],
    hiddenRegionCount: 1,
  });
  assert.deepEqual(summarizeExploreRegions(['SEOUL', 'BUSAN', 'JEJU'], 'SEOUL'), {
    shownRegions: ['SEOUL', 'BUSAN'],
    hiddenRegionCount: 1,
  });
  assert.deepEqual(summarizeExploreRegions(['BUSAN', 'SEOUL', 'JEJU'], 'SEOUL'), {
    shownRegions: ['SEOUL', 'BUSAN'],
    hiddenRegionCount: 1,
  });
  assert.deepEqual(summarizeExploreRegions(['BUSAN', 'JEJU'], 'SEOUL'), {
    shownRegions: ['BUSAN', 'JEJU'],
    hiddenRegionCount: 0,
  });
});

test('탐색 지역 요약은 원본 응답 배열을 바꾸지 않는다', () => {
  const regions = ['BUSAN', 'SEOUL', 'JEJU'];
  summarizeExploreRegions(regions, 'SEOUL');
  assert.deepEqual(regions, ['BUSAN', 'SEOUL', 'JEJU']);
});
