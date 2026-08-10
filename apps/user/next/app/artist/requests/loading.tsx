import { Card } from '@dearbloom/ui';
import { AppLogoHeader } from '@/src/components/common/AppLogoHeader';
import { ARTIST_HOME_HREF } from '@/src/lib/env';

/** force-dynamic 서버 페치라 응답 전까지 빈 화면이 뜬다 — 목록 모양의 자리표시자를 먼저 보여준다. */
export default function ArtistRequestsLoading() {
  return (
    <div className="mx-auto max-w-md" aria-busy>
      <AppLogoHeader logoHref={ARTIST_HOME_HREF} />
      <div className="flex gap-2 px-4 py-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-20 shrink-0 animate-pulse rounded-full bg-neutral-200" />
        ))}
      </div>
      <ul className="flex flex-col gap-2 px-4 pb-4">
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <Card className="flex flex-col gap-2 p-4">
              <div className="h-5 w-20 animate-pulse rounded-sm bg-neutral-200" />
              <div className="h-7 w-40 animate-pulse rounded-md bg-neutral-200" />
              <div className="h-4 w-full animate-pulse rounded-sm bg-neutral-200" />
              <div className="h-5 w-48 animate-pulse rounded-sm bg-neutral-200" />
            </Card>
          </li>
        ))}
      </ul>
      <span className="sr-only">받은 문의를 불러오는 중이에요.</span>
    </div>
  );
}
