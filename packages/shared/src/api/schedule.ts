import { apiGet, apiPut, apiPost, apiDelete, type RequestOptions } from './http';

/**
 * 작가 일정(Schedule) API — 모두 로그인(작가) 필요.
 * 규칙(rule) 기반: 기본 촬영 가능(WEEKLY_AVAILABLE) / 반복 예약 불가(RECURRING_BLOCK) / 개인 예약 불가(DATE_BLOCK).
 * 시간은 'HH:MM:SS', 날짜는 'YYYY-MM-DD'.
 */

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type ScheduleRuleType = 'WEEKLY_AVAILABLE' | 'RECURRING_BLOCK' | 'DATE_BLOCK';

export interface ScheduleRule {
  scheduleRuleId: number;
  ruleType: ScheduleRuleType;
  /** 요일 규칙(weekly/recurring)일 때. date 규칙이면 null. */
  dayOfWeek: DayOfWeek | null;
  /** 날짜 규칙(date block)일 때 'YYYY-MM-DD'. 아니면 null. */
  blockDate: string | null;
  startTime: string;
  endTime: string;
}

export interface ScheduleSummary {
  weeklyAvailabilityList: ScheduleRule[];
  recurringBlockList: ScheduleRule[];
  dateBlockList: ScheduleRule[];
}

export interface WeeklyAvailabilityInput {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface RecurringBlockInput {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface DateBlockInput {
  date: string;
  startTime: string;
  endTime: string;
}

// ---- 요약 / 캘린더 ----

/** 일정 규칙 요약(기본가능/반복불가/개인불가 한 번에). */
export function getScheduleSummary(opts: RequestOptions): Promise<ScheduleSummary> {
  return apiGet<ScheduleSummary>('/api/artists/me/schedule/summary', opts);
}

/** 합성 가용 슬롯(캘린더). */
export function getSchedule(opts: RequestOptions): Promise<unknown> {
  return apiGet<unknown>('/api/artists/me/schedule', opts);
}

// ---- 기본 촬영 가능 일정(주간) ----

export function getWeeklyAvailability(opts: RequestOptions): Promise<ScheduleRule[]> {
  return apiGet<ScheduleRule[]>('/api/artists/me/schedule/weekly', opts);
}

/** 주간 가능 일정 전체 교체(덮어쓰기). */
export function updateWeeklyAvailability(
  availabilityList: WeeklyAvailabilityInput[],
  opts: RequestOptions,
): Promise<void> {
  return apiPut<void>('/api/artists/me/schedule/weekly', { availabilityList }, opts);
}

// ---- 반복 예약 불가 ----

export function getRecurringBlocks(opts: RequestOptions): Promise<ScheduleRule[]> {
  return apiGet<ScheduleRule[]>('/api/artists/me/schedule/recurring-blocks', opts);
}

export function addRecurringBlock(input: RecurringBlockInput, opts: RequestOptions): Promise<void> {
  return apiPost<void>('/api/artists/me/schedule/recurring-blocks', input, opts);
}

export function deleteRecurringBlock(scheduleRuleId: number, opts: RequestOptions): Promise<void> {
  return apiDelete<void>(`/api/artists/me/schedule/recurring-blocks/${scheduleRuleId}`, undefined, opts);
}

// ---- 개인 예약 불가(특정 날짜) ----

export function getDateBlocks(opts: RequestOptions): Promise<ScheduleRule[]> {
  return apiGet<ScheduleRule[]>('/api/artists/me/schedule/date-blocks', opts);
}

export function addDateBlock(input: DateBlockInput, opts: RequestOptions): Promise<void> {
  return apiPost<void>('/api/artists/me/schedule/date-blocks', input, opts);
}

export function deleteDateBlock(scheduleRuleId: number, opts: RequestOptions): Promise<void> {
  return apiDelete<void>(`/api/artists/me/schedule/date-blocks/${scheduleRuleId}`, undefined, opts);
}
