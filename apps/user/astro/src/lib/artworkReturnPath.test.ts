import assert from 'node:assert/strict';
import test from 'node:test';
import { getArtworkBackHref, shouldUseArtworkHistoryBack } from './artworkReturnPath.ts';

test('작품 상세는 검증된 공동보드 경로로만 복귀한다', () => {
  assert.equal(getArtworkBackHref('/app/boards/12'), '/app/boards/12');
  assert.equal(getArtworkBackHref('/app/boards/0'), '/snaps');
  assert.equal(getArtworkBackHref('//example.com'), '/snaps');
  assert.equal(getArtworkBackHref(null), '/snaps');
});

test('이미지 화면에서 돌아온 작품 상세는 이미지 history를 다시 밟지 않는다', () => {
  const origin = 'https://dearbloom.co.kr';

  assert.equal(shouldUseArtworkHistoryBack(`${origin}/snaps/-27/images`, '/snaps/-27', origin, 3), false);
  assert.equal(shouldUseArtworkHistoryBack(`${origin}/snaps/-27/images/4`, '/snaps/-27', origin, 4), false);
  assert.equal(shouldUseArtworkHistoryBack(`${origin}/snaps`, '/snaps/-27', origin, 2), true);
});
