import { cn, SkeletonImage } from '@dearbloom/ui';

interface CollageArtwork {
  thumbnailUrl?: string | null;
}

/** 보드 대표 콜라주 — 담긴 작품 앞 4개를 2×2 로 배치. */
export function BoardCollage({ artworks, className }: { artworks: CollageArtwork[]; className?: string }) {
  const cells = artworks.slice(0, 4);

  // 빈 칸(4개를 못 채운 보드)은 src 가 없어 회색 타일로만 남는다.
  const tile = (a: CollageArtwork | undefined, i: number) => (
    <SkeletonImage key={i} src={a?.thumbnailUrl ?? undefined} alt="" loading="lazy" className="h-full w-full" />
  );

  return (
    <div className={cn('grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-lg bg-neutral-0', className)}>
      {Array.from({ length: 4 }, (_, i) => tile(cells[i], i))}
    </div>
  );
}
