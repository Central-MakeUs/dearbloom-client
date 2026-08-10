import assert from 'node:assert/strict';
import test from 'node:test';
import { getBoardNameError, getBoardNameLength } from './boardName.ts';

test('공동보드 이름은 필수이며 12자까지 허용한다', () => {
  assert.equal(getBoardNameError('', true), '공동보드 이름을 입력하세요');
  assert.equal(getBoardNameError('가'.repeat(12), true), undefined);
  assert.equal(getBoardNameError('가'.repeat(13)), '최대 12자까지 입력할 수 있어요');
  assert.equal(getBoardNameLength('우정스냅 보드'), 6);
});
