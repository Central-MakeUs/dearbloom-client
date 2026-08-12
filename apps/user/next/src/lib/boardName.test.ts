import assert from 'node:assert/strict';
import test from 'node:test';
import { getBoardNameError, getBoardNameLength, isValidBoardName } from './boardName.ts';

test('공동보드 이름은 공백과 한글 자모를 포함해 2~12자로 센다', () => {
  assert.equal(getBoardNameError('', true), '최소 2자 이상 입력하세요');
  assert.equal(getBoardNameError('가', true), '최소 2자 이상 입력하세요');
  assert.equal(getBoardNameError('가 나', true), undefined);
  assert.equal(getBoardNameError('가'.repeat(12), true), undefined);
  assert.equal(getBoardNameError('가'.repeat(13)), '최대 12자까지 입력할 수 있어요');
  assert.equal(getBoardNameLength('우정스냅 보드'), 7);
  assert.equal(getBoardNameLength('같이의가치ㅇㅇㅇㅇ      완'), 16);
  assert.equal(isValidBoardName('가'), false);
  assert.equal(isValidBoardName('가 '), false);
  assert.equal(isValidBoardName('가 나'), true);
});
