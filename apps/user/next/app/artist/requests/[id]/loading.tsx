import { Card, CardContent, Header as TitleHeader, Skeleton } from '@dearbloom/ui';

/** 상세도 force-dynamic 이라 응답 전까지 빈 화면이 뜬다. */
export default function ArtistRequestDetailLoading() {
  return (
    <div className="mx-auto max-w-md" aria-busy>
      <TitleHeader backHref="/app/artist/requests" title="신청 상세" />
      <div className="px-4 pt-3">
        <Card className="flex flex-col gap-2 p-4">
          <Skeleton className="h-5 w-24 rounded-sm" />
          <Skeleton className="h-7 w-32" />
        </Card>
      </div>
      <div className="px-4 py-3">
        <Card className="overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-5 w-full rounded-sm" />
            ))}
          </CardContent>
        </Card>
      </div>
      <span className="sr-only">문의 상세를 불러오는 중이에요.</span>
    </div>
  );
}
