import assert from 'node:assert/strict';
import test from 'node:test';
import type { SharedSavedArtwork } from '@dearbloom/shared';
import { remainingSharedArtworkIds } from './savedArtworkCascade.ts';

const artwork = (artworkId: number, isShared: boolean) =>
  ({ artworkSummaryResponse: { artworkId }, isShared }) as SharedSavedArtwork;

test('삭제 작품을 내가 공유한 후보에서만 제외한다', () => {
  const artworks = [artwork(1, true), artwork(2, false), artwork(3, true)];

  assert.deepEqual(remainingSharedArtworkIds(artworks, new Set([1, 2])), [3]);
  assert.equal(remainingSharedArtworkIds(artworks, new Set([2])), undefined);
});
