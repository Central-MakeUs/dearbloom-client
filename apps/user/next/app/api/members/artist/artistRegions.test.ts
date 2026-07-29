import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArtistRegions } from './artistRegions.ts';

const options = [
  { label: '서울', value: 'SEOUL' },
  { label: '경기 북부', value: 'GYEONGGI_NORTH' },
] as const;

test('작가 활동지역 배열을 검증하고 중복을 제거한다', () => {
  assert.deepEqual(parseArtistRegions(['SEOUL', '경기 북부', 'SEOUL'], options), [
    'SEOUL',
    'GYEONGGI_NORTH',
  ]);
  assert.equal(parseArtistRegions([], options), undefined);
  assert.equal(parseArtistRegions(['없는 지역'], options), undefined);
});
