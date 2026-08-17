import { cookies } from 'next/headers';
import {
  getWeeklyAvailability,
  getRecurringBlocks,
  getDateBlocks,
  getSchedule,
  type DayAvailability,
  type ScheduleRule,
} from '@dearbloom/shared';
import { ScheduleManager } from './ScheduleManager';
import { LoginRequired } from '../../(auth)/LoginRequired';
import { Header as TitleHeader } from '@dearbloom/ui';

export const dynamic = 'force-dynamic';

const Header = () => <TitleHeader backHref="/app/artist/dashboard" title="일정 관리" />;

export default async function ArtistSchedulePage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <Header />
        <LoginRequired
          description="작가 계정으로 로그인하면 일정을 관리할 수 있어요."
          returnUrl="/app/artist/schedule"
        />
      </div>
    );
  }

  // 실패를 빈 배열로 삼키면 '조회 실패'와 '아직 설정 안 함'이 구분되지 않는다.
  // (실패인데 기본값이 채워진 화면에서 저장하면 서버의 기존 일정을 덮어쓴다)
  // availability 는 미리보기 전용이라 실패해도 편집은 계속할 수 있어야 한다 — loadFailed 에 넣지 않는다.
  const [weekly, recurring, dates, availability] = await Promise.all([
    getWeeklyAvailability({ token }).catch(() => null),
    getRecurringBlocks({ token }).catch(() => null),
    getDateBlocks({ token }).catch(() => null),
    getSchedule({ token }).catch(() => null),
  ]);
  const loadFailed = weekly === null || recurring === null || dates === null;

  return (
    <div className="mx-auto max-w-md">
      <Header />
      <ScheduleManager
        weekly={weekly ?? ([] as ScheduleRule[])}
        recurring={recurring ?? ([] as ScheduleRule[])}
        dates={dates ?? ([] as ScheduleRule[])}
        availability={availability ?? ([] as DayAvailability[])}
        loadFailed={loadFailed}
      />
    </div>
  );
}
