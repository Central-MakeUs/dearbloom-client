import assert from 'node:assert/strict';
import test from 'node:test';
import { getInitialImageIndex, matchesImageSchool } from './imageViewer.ts';

test('이미지 URL 순번을 유효한 0-based index로 보정한다', () => {
  assert.equal(getInitialImageIndex('4', 6), 3);
  assert.equal(getInitialImageIndex('0', 6), 0);
  assert.equal(getInitialImageIndex('20', 6), 5);
  assert.equal(getInitialImageIndex('invalid', 6), 0);
  assert.equal(getInitialImageIndex('1', 0), 0);
});

test('선택한 학교의 이미지만 필터링한다', () => {
  assert.equal(matchesImageSchool('연세대학교', ''), true);
  assert.equal(matchesImageSchool(undefined, ''), true);
  assert.equal(matchesImageSchool('연세대학교', '연세대학교'), true);
  assert.equal(matchesImageSchool('홍익대학교', '연세대학교'), false);
  assert.equal(matchesImageSchool(undefined, '연세대학교'), false);
});
