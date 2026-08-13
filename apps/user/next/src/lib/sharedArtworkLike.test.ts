import assert from 'node:assert/strict';
import test from 'node:test';
import { getNextSharedArtworkLike, getRankedSharedArtworks } from './sharedArtworkLike.ts';

test('공동보드 좋아요를 낙관적으로 토글하며 개수는 0 아래로 내려가지 않는다', () => {
  assert.deepEqual(getNextSharedArtworkLike(false, 0), { isLiked: true, likeCount: 1 });
  assert.deepEqual(getNextSharedArtworkLike(true, 3), { isLiked: false, likeCount: 2 });
  assert.deepEqual(getNextSharedArtworkLike(true), { isLiked: false, likeCount: 0 });
});

test('좋아요순 상위 3개만 순위를 부여하고 좋아요 0개는 제외한다', () => {
  const ranked = getRankedSharedArtworks([
    { id: 1, likeCount: 0 },
    { id: 2, likeCount: 1 },
    { id: 3, likeCount: 3 },
    { id: 4, likeCount: 2 },
    { id: 5, likeCount: 0 },
  ]);

  assert.deepEqual(
    ranked.map(({ artwork, rank }) => [artwork.id, rank]),
    [
      [3, 1],
      [4, 2],
      [2, 3],
      [1, undefined],
      [5, undefined],
    ],
  );
  assert.deepEqual(getRankedSharedArtworks([{ id: 1, likeCount: 1 }, { id: 2, likeCount: 0 }]), [
    { artwork: { id: 1, likeCount: 1 }, rank: 1 },
    { artwork: { id: 2, likeCount: 0 }, rank: undefined },
  ]);
});
