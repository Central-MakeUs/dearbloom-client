import { cookies } from 'next/headers';
import { getWeeklyAvailability, getRecurringBlocks, getDateBlocks, type ScheduleRule } from '@dearbloom/shared';
import { ScheduleManager } from './ScheduleManager';
import { LOGIN_HREF } from '@/src/lib/env';
import { Header as TitleHeader } from '@dearbloom/ui';

export const dynamic = 'force-dynamic';

const Header = () => <TitleHeader backHref="/app/artist/dashboard" title="일정 관리" />;

export default async function ArtistSchedulePage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <Header />
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">작가 계정으로 로그인해주세요.</p>
          <a href={LOGIN_HREF} className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">로그인</a>
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
