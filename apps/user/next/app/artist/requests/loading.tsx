import { Card, Header, Skeleton } from '@dearbloom/ui';

/** force-dynamic 서버 페치라 응답 전까지 빈 화면이 뜬다 — 목록 모양의 자리표시자를 먼저 보여준다. */
export default function ArtistRequestsLoading() {
  return (
    <div className="mx-auto max-w-md" aria-busy>
      <Header showBack={false} title="신청 관리" />
      <div className="flex gap-2 px-4 py-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-20 shrink-0 rounded-full" />
        ))}
      </div>
      <ul className="flex flex-col gap-2 px-4 pb-4">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <Card className="flex flex-col gap-2 p-4">
              <Skeleton className="h-5 w-20 rounded-sm" />
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-full rounded-sm" />
              <Skeleton className="h-5 w-48 rounded-sm" />
            </Card>
          </li>
        ))}
      </ul>
      <span className="sr-only">받은 문의를 불러오는 중이에요.</span>
    </div>
  );
}
