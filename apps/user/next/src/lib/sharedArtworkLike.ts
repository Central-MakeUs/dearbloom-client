export function getNextSharedArtworkLike(isLiked: boolean, likeCount = 0) {
  const nextIsLiked = !isLiked;
  return {
    isLiked: nextIsLiked,
    likeCount: Math.max(0, likeCount + (nextIsLiked ? 1 : -1)),
  };
}
