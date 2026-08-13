import assert from 'node:assert/strict';
import test from 'node:test';
import { isSharedBoardOwner, parseSharedBoardId } from './sharedBoardId.ts';

test('공동보드 ID는 양의 안전한 정수만 허용한다', () => {
  assert.equal(parseSharedBoardId('1'), 1);
  assert.equal(parseSharedBoardId('mslyfsck'), undefined);
  assert.equal(parseSharedBoardId('0'), undefined);
  assert.equal(parseSharedBoardId('1.5'), undefined);
  assert.equal(parseSharedBoardId('9007199254740992'), undefined);
});

test('공동보드 첫 멤버인 생성자만 owner다', () => {
  const members = [{ customerId: 7 }, { customerId: 9 }];
  assert.equal(isSharedBoardOwner(7, members), true);
  assert.equal(isSharedBoardOwner(9, members), false);
  assert.equal(isSharedBoardOwner(7, []), false);
});
