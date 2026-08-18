import { cn, SkeletonImage } from '@dearbloom/ui';
import { optimizedImageUrl } from '@/src/lib/imageUrl';

interface CollageArtwork {
  thumbnailUrl?: string | null;
}

/** 콜라주 한 칸의 표시 폭(px) — 보드 카드(202) 안에서 2열로 나뉜 크기. */
const CELL_WIDTH = 100;

/** 보드 대표 콜라주 — 담긴 작품 앞 4개를 2×2 로 배치. */
export function BoardCollage({ artworks, className }: { artworks: CollageArtwork[]; className?: string }) {
  const cells = artworks.slice(0, 4);

  // 빈 칸(4개를 못 채운 보드)은 src 가 없어 회색 타일로만 남는다.
  const tile = (a: CollageArtwork | undefined, i: number) => (
    <SkeletonImage key={i} src={optimizedImageUrl(a?.thumbnailUrl, CELL_WIDTH)} alt="" loading="lazy" className="h-full w-full" />
  );

  return (
    <div className={cn('grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-lg bg-neutral-0', className)}>
      {Array.from({ length: 4 }, (_, i) => tile(cells[i], i))}
    </div>
  );
}
