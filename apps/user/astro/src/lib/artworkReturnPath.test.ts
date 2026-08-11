import assert from 'node:assert/strict';
import test from 'node:test';
import { getArtworkBackHref } from './artworkReturnPath.ts';

test('작품 상세는 검증된 공동보드 경로로만 복귀한다', () => {
  assert.equal(getArtworkBackHref('/app/boards/12'), '/app/boards/12');
  assert.equal(getArtworkBackHref('/app/boards/0'), '/snaps');
  assert.equal(getArtworkBackHref('//example.com'), '/snaps');
  assert.equal(getArtworkBackHref(null), '/snaps');
});
