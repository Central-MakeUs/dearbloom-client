import { Card, Header, Skeleton } from '@dearbloom/ui';

/** 내 작품 자리표시자 — MyArtworkList 의 행 모양을 따른다. */
export default function ArtistProductsLoading() {
  return (
    <div className="mx-auto max-w-md pb-10" aria-busy>
      <Header showBack={false} title="내 작품" />
      <div className="mb-3 px-4 pt-1">
        <Skeleton className="h-4 w-10" />
      </div>
      <div className="flex flex-col gap-2 px-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="size-16 shrink-0" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-5 w-20" />
              <Skeleton className="mt-1 h-4 w-28" />
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </Card>
        ))}
      </div>
      <span className="sr-only">내 작품을 불러오는 중이에요.</span>
    </div>
  );
}
