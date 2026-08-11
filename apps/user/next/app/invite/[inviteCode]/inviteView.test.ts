import assert from 'node:assert/strict';
import test from 'node:test';
import { getInviteView } from './inviteView.ts';

test('초대 링크는 로그인 상태와 로그인 완료 복귀 여부에 맞는 화면을 고른다', () => {
  assert.equal(getInviteView(false), 'guest');
  assert.equal(getInviteView(false, '1'), 'guest');
  assert.equal(getInviteView(true), 'member');
  assert.equal(getInviteView(true, '1'), 'login-complete');
});
