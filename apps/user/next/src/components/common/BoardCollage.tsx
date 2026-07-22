import { cn } from '@dearbloom/ui';
import type { BoardArtwork } from '@/src/stores/boardStore';

/** 보드 대표 콜라주 — 담긴 작품 앞 4개를 2×2 로 배치. 썸네일 없으면 그라디언트. */
export function BoardCollage({ artworks, className }: { artworks: BoardArtwork[]; className?: string }) {
  const cells = artworks.slice(0, 4);
  const empty = cells.length === 0;

  const tile = (a: BoardArtwork | undefined, i: number) =>
    a?.thumbnailUrl ? (
      <img key={i} src={a.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
    ) : (
      <div key={i} className="h-full w-full bg-gradient-to-br from-primary-100 to-primary-300" />
    );

  return (
    <div className={cn('grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-lg bg-neutral-200', className)}>
      {empty
        ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-full w-full bg-neutral-100" />)
        : Array.from({ length: 4 }, (_, i) => tile(cells[i], i))}
    </div>
  );
}
