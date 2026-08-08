import { cookies } from 'next/headers';
import { getWeeklyAvailability, getRecurringBlocks, getDateBlocks, type ScheduleRule } from '@dearbloom/shared';
import { Button, Header } from '@dearbloom/ui';
import { ScheduleManager } from './ScheduleManager';
import { LOGIN_HREF } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

const header = (
  <Header title="일정 관리" backHref="/app/artist/dashboard" className="sticky top-0 z-10" />
);

export default async function ArtistSchedulePage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        {header}
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">작가 계정으로 로그인해주세요.</p>
          <Button asChild size="sm">
            <a href={LOGIN_HREF}>로그인</a>
          </Button>
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
      {header}
      <ScheduleManager weekly={weekly} recurring={recurring} dates={dates} />
    </div>
  );
}
