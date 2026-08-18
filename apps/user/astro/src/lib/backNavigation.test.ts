import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldUseHistoryBack } from './backNavigation.ts';

const origin = 'https://dearbloom.co.kr';

test('기대한 부모 화면에서 왔으면 history를 되감는다', () => {
  assert.equal(shouldUseHistoryBack(`${origin}/snaps?school=1`, '/snaps', origin, 2), true);
  assert.equal(shouldUseHistoryBack(`${origin}/snaps/27`, '/snaps/27', origin, 3), true);
  assert.equal(shouldUseHistoryBack(`${origin}/snaps/27/images`, '/snaps/27/images', origin, 4), true);
  assert.equal(
    shouldUseHistoryBack(`${origin}/app/saved?tab=board`, '/app/saved?tab=board', origin, 2),
    true,
  );
  assert.equal(
    shouldUseHistoryBack('', '/snaps/27', origin, 3, {
      dearbloomBackHref: '/snaps/27',
    }),
    true,
  );
});

test('다른 화면이나 직접 진입은 fallback으로 교체한다', () => {
  assert.equal(shouldUseHistoryBack(`${origin}/snaps/27/images`, '/snaps', origin, 4), false);
  assert.equal(shouldUseHistoryBack(`${origin}/snaps/27/images/4`, '/snaps/27', origin, 4), false);
  assert.equal(shouldUseHistoryBack(`${origin}/snaps`, '/snaps/27/images', origin, 1), false);
  assert.equal(shouldUseHistoryBack('https://example.com/snaps', '/snaps', origin, 2), false);
});
