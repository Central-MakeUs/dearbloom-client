import type { SharedSavedArtwork } from '@dearbloom/shared';

export function remainingSharedArtworkIds(
  artworks: SharedSavedArtwork[],
  removedIds: ReadonlySet<number>,
) {
  const sharedIds = artworks
    .filter((artwork) => artwork.isShared)
    .map((artwork) => artwork.artworkSummaryResponse.artworkId);
  const remainingIds = sharedIds.filter((id) => !removedIds.has(id));

  return remainingIds.length === sharedIds.length ? undefined : remainingIds;
}
