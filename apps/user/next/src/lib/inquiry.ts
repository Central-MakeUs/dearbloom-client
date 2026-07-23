import type { DayOfWeek } from '@dearbloom/shared';

const DAY_KR: Record<DayOfWeek, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

/** '2026-08-05 (수) 10:00' */
export function shootLabel(date: string, day: DayOfWeek, startTime: string): string {
  return `${date} (${DAY_KR[day] ?? ''}) ${startTime.slice(0, 5)}`;
}

/** 상태 뱃지 색상 클래스 */
export function inquiryStatusClass(status: string): string {
  if (status === 'RESERVED') return 'bg-primary-100 text-primary';
  if (status.includes('CANCEL')) return 'bg-neutral-200 text-neutral-500';
  return 'bg-neutral-200 text-neutral-700';
}
