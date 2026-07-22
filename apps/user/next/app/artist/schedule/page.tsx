import { cookies } from 'next/headers';
import { getWeeklyAvailability, getRecurringBlocks, getDateBlocks, type ScheduleRule } from '@dearbloom/shared';
import { ScheduleManager } from './ScheduleManager';

export const dynamic = 'force-dynamic';

const Header = () => (
  <header className="sticky top-0 z-10 flex h-[52px] items-center bg-neutral-100 px-2">
    <a href="/app/artist/dashboard" aria-label="뒤로가기" className="flex h-11 w-11 items-center justify-center text-neutral-950">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m15 18-6-6 6-6" />
      </svg>
    </a>
    <h1 className="absolute left-1/2 -translate-x-1/2 text-head-3 text-neutral-950">일정 관리</h1>
  </header>
);

export default async function ArtistSchedulePage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <Header />
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">작가 계정으로 로그인해주세요.</p>
          <a href="/app/dev/login" className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">로그인</a>
        </div>
      </div>
    );
  }

  const [weekly, recurring, dates] = await Promise.all([
    getWeeklyAvailability({ token }).catch(() => [] as ScheduleRule[]),
    getRecurringBlocks({ token }).catch(() => [] as ScheduleRule[]),
    getDateBlocks({ token }).catch(() => [] as ScheduleRule[]),
  ]);

  return (
    <div className="mx-auto max-w-md">
      <Header />
      <ScheduleManager weekly={weekly} recurring={recurring} dates={dates} />
    </div>
  );
}
