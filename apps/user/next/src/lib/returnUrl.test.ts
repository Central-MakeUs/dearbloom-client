import assert from 'node:assert/strict';
import test from 'node:test';

import { getRoleLoginDestination, getRoleReturnUrl } from './returnUrl.ts';

test('로그인 역할과 맞지 않는 복귀 경로는 역할 홈으로 보낸다', () => {
  assert.equal(getRoleLoginDestination('ARTIST', '/app/my'), '/app/artist/dashboard');
  assert.equal(getRoleLoginDestination('ARTIST', '/app/artist/products'), '/app/artist/products');
  assert.equal(getRoleLoginDestination('CUSTOMER', '/app/artist/my'), '/snaps');
  assert.equal(getRoleLoginDestination('CUSTOMER', '/app/boards/1'), '/app/boards/1');
});

test('온보딩에는 선택 역할과 맞는 복귀 경로만 전달한다', () => {
  assert.equal(getRoleReturnUrl('ARTIST', '/app/my'), undefined);
  assert.equal(getRoleReturnUrl('CUSTOMER', '/app/artist/dashboard'), undefined);
  assert.equal(getRoleReturnUrl('CUSTOMER', '/app/invite/ABC'), '/app/invite/ABC');
});
