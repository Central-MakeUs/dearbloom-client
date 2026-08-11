import { cn } from '@dearbloom/ui';

interface CollageArtwork {
  thumbnailUrl?: string | null;
}

/** 보드 대표 콜라주 — 담긴 작품 앞 4개를 2×2 로 배치. */
export function BoardCollage({ artworks, className }: { artworks: CollageArtwork[]; className?: string }) {
  const cells = artworks.slice(0, 4);

  const tile = (a: CollageArtwork | undefined, i: number) =>
    a?.thumbnailUrl ? (
      <img key={i} src={a.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
    ) : (
      <div key={i} className="h-full w-full bg-neutral-200" />
    );

  return (
    <div className={cn('grid aspect-square grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-lg bg-neutral-0', className)}>
      {Array.from({ length: 4 }, (_, i) => tile(cells[i], i))}
    </div>
  );
}
