import assert from 'node:assert/strict';
import test from 'node:test';

import { getMemberHome } from './memberHome.ts';

test('활성 역할에 맞는 로그인 홈을 반환한다', () => {
  const member = { hasArtist: true, hasCustomer: true };

  assert.equal(getMemberHome('ARTIST', member), '/app/artist/dashboard');
  assert.equal(getMemberHome('CUSTOMER', member), '/snaps');
  assert.equal(
    getMemberHome(undefined, { hasArtist: true, hasCustomer: false }),
    '/app/artist/dashboard',
  );
});
