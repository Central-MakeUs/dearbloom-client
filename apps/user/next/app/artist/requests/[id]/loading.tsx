import { Card, CardContent, Header as TitleHeader } from '@dearbloom/ui';

/** 상세도 force-dynamic 이라 응답 전까지 빈 화면이 뜬다. */
export default function ArtistRequestDetailLoading() {
  return (
    <div className="mx-auto max-w-md" aria-busy>
      <TitleHeader backHref="/app/artist/requests" title="신청 상세" />
      <div className="px-4 pt-3">
        <Card className="flex flex-col gap-2 p-4">
          <div className="h-5 w-24 animate-pulse rounded-sm bg-neutral-200" />
          <div className="h-7 w-32 animate-pulse rounded-md bg-neutral-200" />
        </Card>
      </div>
      <div className="px-4 py-3">
        <Card className="overflow-hidden">
          <div className="aspect-[4/3] w-full animate-pulse bg-neutral-200" />
          <CardContent className="flex flex-col gap-2">
            <div className="h-6 w-40 animate-pulse rounded-md bg-neutral-200" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-5 w-full animate-pulse rounded-sm bg-neutral-200" />
            ))}
          </CardContent>
        </Card>
      </div>
      <span className="sr-only">문의 상세를 불러오는 중이에요.</span>
    </div>
  );
}
