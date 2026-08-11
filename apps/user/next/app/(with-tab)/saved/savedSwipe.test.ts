import assert from 'node:assert/strict';
import test from 'node:test';
import { getSwipedTab } from './savedSwipe.ts';

test('가로 스와이프만 저장 탭을 전환한다', () => {
  assert.equal(getSwipedTab({ x: 200, y: 100 }, { x: 100, y: 105 }), 'board');
  assert.equal(getSwipedTab({ x: 100, y: 100 }, { x: 200, y: 105 }), 'saved');
  assert.equal(getSwipedTab({ x: 100, y: 100 }, { x: 130, y: 100 }), undefined);
  assert.equal(getSwipedTab({ x: 100, y: 100 }, { x: 160, y: 200 }), undefined);
});
