import assert from 'node:assert/strict';
import test from 'node:test';

import { withFlashToast } from './flashToast.ts';

test('토스트 상태를 내부 경로에 추가하고 기존 쿼리와 해시를 보존한다', () => {
  assert.equal(withFlashToast('/snaps', 'welcome'), '/snaps?_toast=welcome');
  assert.equal(
    withFlashToast('/app/invite/ABC?loginComplete=1#member', 'login'),
    '/app/invite/ABC?loginComplete=1&_toast=login#member',
  );
});
