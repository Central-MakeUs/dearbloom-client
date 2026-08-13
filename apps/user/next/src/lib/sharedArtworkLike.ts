export function getNextSharedArtworkLike(isLiked: boolean, likeCount = 0) {
  const nextIsLiked = !isLiked;
  return {
    isLiked: nextIsLiked,
    likeCount: Math.max(0, likeCount + (nextIsLiked ? 1 : -1)),
  };
}

export function getRankedSharedArtworks<T extends { likeCount: number }>(artworks: readonly T[]) {
  return [...artworks]
    .sort((a, b) => b.likeCount - a.likeCount)
    .map((artwork, index) => ({
      artwork,
      rank: artwork.likeCount > 0 && index < 3 ? index + 1 : undefined,
    }));
}
