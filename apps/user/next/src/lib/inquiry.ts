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

/** '오전 10:00' */
export function ampmTimeLabel(time: string): string {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  return `${hour < 12 ? '오전' : '오후'} ${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** '1시간 30분' */
export function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours && remainingMinutes) return `${hours}시간 ${remainingMinutes}분`;
  return hours ? `${hours}시간` : `${remainingMinutes}분`;
}

/** 상태 뱃지 색상 클래스 */
export function inquiryStatusClass(status: string): string {
  if (status === 'RESERVED') return 'bg-primary-100 text-primary';
  if (status.includes('CANCEL')) return 'bg-neutral-200 text-neutral-500';
  return 'bg-neutral-200 text-neutral-700';
}
