import assert from 'node:assert/strict';
import test from 'node:test';
import { getNextSharedArtworkLike } from './sharedArtworkLike.ts';

test('공동보드 좋아요를 낙관적으로 토글하며 개수는 0 아래로 내려가지 않는다', () => {
  assert.deepEqual(getNextSharedArtworkLike(false, 0), { isLiked: true, likeCount: 1 });
  assert.deepEqual(getNextSharedArtworkLike(true, 3), { isLiked: false, likeCount: 2 });
  assert.deepEqual(getNextSharedArtworkLike(true), { isLiked: false, likeCount: 0 });
});
