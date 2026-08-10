'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import type { DayOfWeek, ScheduleRule } from '@dearbloom/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from '@dearbloom/ui';
import { TimeSelect, START_SLOTS, endSlotsAfter, nextSlot } from './TimeSelect';
import { DateField, formatKoreanDate } from './DateField';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'MONDAY', label: '월' },
  { key: 'TUESDAY', label: '화' },
  { key: 'WEDNESDAY', label: '수' },
  { key: 'THURSDAY', label: '목' },
  { key: 'FRIDAY', label: '금' },
  { key: 'SATURDAY', label: '토' },
  { key: 'SUNDAY', label: '일' },
];
const dayIndex = (d: DayOfWeek | null) => DAYS.findIndex((x) => x.key === d);
const dayLabel = (d: DayOfWeek | null) => DAYS.find((x) => x.key === d)?.label ?? '';
const hhmm = (t: string) => t.slice(0, 5);
const hhmmss = (t: string) => (t.length === 5 ? `${t}:00` : t);

/** 로컬 기준 오늘 'YYYY-MM-DD' */
function todayISO(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

interface SendResult {
  ok: boolean;
  message?: string;
}

/**
 * 요청 결과를 항상 값으로 돌려준다 — 예외로 빠지면 진행중 상태가 풀리지 않아
 * 버튼이 영구히 잠기므로, 네트워크 오류까지 여기서 흡수한다.
 */
async function send(url: string, method: string, body?: unknown): Promise<SendResult> {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return { ok: true };
    if (res.status === 401) return { ok: false, message: '로그인이 만료되었어요. 다시 로그인해주세요.' };
    const data = (await res.json().catch(() => null)) as { error?: unknown } | null;
    return { ok: false, message: typeof data?.error === 'string' ? data.error : undefined };
  } catch {
    return { ok: false, message: '네트워크 연결을 확인해주세요.' };
  }
}

const BASE = '/app/api/artist/schedule';

type BlockKind = 'recurring-blocks' | 'date-blocks';
/** 진행 중인 요청 종류 — 버튼별 스피너와 중복 요청 차단에 쓴다. */
type Pending = null | 'weekly' | 'recurring' | 'date' | 'delete';

interface DayState {
  enabled: boolean;
  start: string;
  end: string;
}

interface DeleteTarget {
  kind: BlockKind;
  id: number;
  label: string;
}

const REC_DEFAULT = { day: 'MONDAY' as DayOfWeek, start: '12:00', end: '13:00' };
const BLK_DEFAULT = { start: '09:00', end: '18:00' };

/** 저장된 일정이 없을 때 켜둘 요일 — 평일. */
const DEFAULT_DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const DAY_HOURS_DEFAULT = { start: '09:00', end: '18:00' };
const MIN_DAY_MESSAGE = '촬영 가능 요일은 1개 이상 선택해야 해요.';

function buildDays(weekly: ScheduleRule[], useDefault: boolean): Record<DayOfWeek, DayState> {
  const init = {} as Record<DayOfWeek, DayState>;
  for (const d of DAYS) {
    const rule = weekly.find((w) => w.dayOfWeek === d.key);
    init[d.key] = rule
      ? { enabled: true, start: hhmm(rule.startTime), end: hhmm(rule.endTime) }
      : { enabled: useDefault && DEFAULT_DAYS.includes(d.key), ...DAY_HOURS_DEFAULT };
  }
  return init;
}

export function ScheduleManager({
  weekly,
  recurring,
  dates,
  loadFailed = false,
}: {
  weekly: ScheduleRule[];
  recurring: ScheduleRule[];
  dates: ScheduleRule[];
  /** 서버 조회가 실패했는지. 실패면 디폴트를 켜지 않고 저장도 막는다(기존 일정 덮어쓰기 방지). */
  loadFailed?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending>(null);
  const [refreshing, startRefresh] = useTransition();
  const disabled = pending !== null || refreshing;

  // 서버/클라이언트 시각 차이로 인한 hydration 불일치를 피하려고 마운트 후에 채운다.
  const [today, setToday] = useState('');
  useEffect(() => setToday(todayISO()), []);

  const refresh = () => startRefresh(() => router.refresh());

  // 기본 촬영 가능 일정 — 요일별 상태.
  // 저장된 일정이 하나도 없으면 평일을 미리 켜둔다(조회 실패 때는 켜지 않는다).
  const useDefault = weekly.length === 0 && !loadFailed;
  const [days, setDays] = useState<Record<DayOfWeek, DayState>>(() => buildDays(weekly, useDefault));
  // 서버에 저장된 값의 스냅샷. 미설정이면 null — 디폴트 그대로도 저장할 수 있어야 하므로 항상 dirty 로 본다.
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(() =>
    weekly.length > 0 ? JSON.stringify(buildDays(weekly, false)) : null,
  );
  const dirty = savedSnapshot === null || JSON.stringify(days) !== savedSnapshot;

  const enabledDayCount = DAYS.filter((d) => days[d.key].enabled).length;
  const toggleDay = (key: DayOfWeek) => {
    if (days[key].enabled && enabledDayCount <= 1) {
      toast.error(MIN_DAY_MESSAGE);
      return;
    }
    setDays((p) => ({ ...p, [key]: { ...p[key], enabled: !p[key].enabled } }));
  };
  const setDayStart = (key: DayOfWeek, v: string) =>
    setDays((p) => ({ ...p, [key]: { ...p[key], start: v, end: p[key].end <= v ? nextSlot(v) : p[key].end } }));
  const setDayEnd = (key: DayOfWeek, v: string) => setDays((p) => ({ ...p, [key]: { ...p[key], end: v } }));

  const saveWeekly = async () => {
    const availabilityList = DAYS.filter((d) => days[d.key].enabled).map((d) => ({
      dayOfWeek: d.key,
      startTime: hhmmss(days[d.key].start),
      endTime: hhmmss(days[d.key].end),
    }));
    if (availabilityList.length === 0) {
      toast.error(MIN_DAY_MESSAGE);
      return;
    }
    setPending('weekly');
    const res = await send(`${BASE}/weekly`, 'PUT', { availabilityList });
    setPending(null);
    if (res.ok) {
      toast.success('저장되었어요.');
      setSavedSnapshot(JSON.stringify(days));
      refresh();
    } else toast.error(res.message ?? '저장에 실패했어요. 시간을 다시 확인해주세요.');
  };

  // 반복 예약 불가 추가 폼
  const [recDay, setRecDay] = useState<DayOfWeek>(REC_DEFAULT.day);
  const [recStart, setRecStart] = useState(REC_DEFAULT.start);
  const [recEnd, setRecEnd] = useState(REC_DEFAULT.end);
  const setRecStartV = (v: string) => {
    setRecStart(v);
    if (recEnd <= v) setRecEnd(nextSlot(v));
  };
  const addRecurring = async () => {
    const duplicate = recurring.some(
      (r) => r.dayOfWeek === recDay && hhmm(r.startTime) === recStart && hhmm(r.endTime) === recEnd,
    );
    if (duplicate) {
      toast.error('이미 추가된 반복 예약 불가예요.');
      return;
    }
    setPending('recurring');
    const res = await send(`${BASE}/recurring-blocks`, 'POST', {
      dayOfWeek: recDay,
      startTime: hhmmss(recStart),
      endTime: hhmmss(recEnd),
    });
    setPending(null);
    if (res.ok) {
      toast.success('추가되었어요.');
      setRecDay(REC_DEFAULT.day);
      setRecStart(REC_DEFAULT.start);
      setRecEnd(REC_DEFAULT.end);
      refresh();
    } else toast.error(res.message ?? '추가에 실패했어요.');
  };

  // 개인 예약 불가 추가 폼
  const [blkDate, setBlkDate] = useState('');
  const [blkStart, setBlkStart] = useState(BLK_DEFAULT.start);
  const [blkEnd, setBlkEnd] = useState(BLK_DEFAULT.end);
  const setBlkStartV = (v: string) => {
    setBlkStart(v);
    if (blkEnd <= v) setBlkEnd(nextSlot(v));
  };
  const addDate = async () => {
    if (!blkDate) {
      toast.error('날짜를 선택해주세요.');
      return;
    }
    if (today && blkDate < today) {
      toast.error('지난 날짜는 선택할 수 없어요.');
      return;
    }
    const duplicate = dates.some(
      (r) => r.blockDate === blkDate && hhmm(r.startTime) === blkStart && hhmm(r.endTime) === blkEnd,
    );
    if (duplicate) {
      toast.error('이미 추가된 예약 불가 날짜예요.');
      return;
    }
    setPending('date');
    const res = await send(`${BASE}/date-blocks`, 'POST', {
      date: blkDate,
      startTime: hhmmss(blkStart),
      endTime: hhmmss(blkEnd),
    });
    setPending(null);
    if (res.ok) {
      toast.success('추가되었어요.');
      setBlkDate('');
      setBlkStart(BLK_DEFAULT.start);
      setBlkEnd(BLK_DEFAULT.end);
      refresh();
    } else toast.error(res.message ?? '추가에 실패했어요.');
  };

  // 삭제 — 확인 후 실행
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { kind, id } = deleteTarget;
    setDeleteTarget(null);
    setPending('delete');
    const res = await send(`${BASE}/${kind}?id=${id}`, 'DELETE');
    setPending(null);
    if (res.ok) {
      toast.success('삭제되었어요.');
      refresh();
    } else toast.error(res.message ?? '삭제에 실패했어요.');
  };

  const sortedRecurring = [...recurring].sort(
    (a, b) => dayIndex(a.dayOfWeek) - dayIndex(b.dayOfWeek) || a.startTime.localeCompare(b.startTime),
  );
  const sortedDates = [...dates].sort(
    (a, b) => (a.blockDate ?? '').localeCompare(b.blockDate ?? '') || a.startTime.localeCompare(b.startTime),
  );

  const spinner = <Loader2 className="animate-spin" aria-hidden />;
  const emptyText = (text: string) => <p className="py-2 text-center text-caption-1 text-neutral-500">{text}</p>;

  const blockRow = (r: ScheduleRule, kind: BlockKind, label: string, past = false) => (
    <li key={r.scheduleRuleId} className="flex items-center justify-between gap-2">
      <span className={cn('text-body-5', past ? 'text-neutral-400 line-through' : 'text-neutral-950')}>{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`${label} 삭제`}
        onClick={() => setDeleteTarget({ kind, id: r.scheduleRuleId, label })}
        disabled={disabled}
        className="h-8 w-8 text-neutral-500 hover:text-danger"
      >
        <Trash2 aria-hidden />
      </Button>
    </li>
  );

  /** 카드 안 '추가' 폼의 CTA — 좁은 폭에서 버튼만 밀리지 않도록 항상 전체 폭 한 줄. */
  const addButton = (onClick: () => void, label: string, busy: boolean) => (
    <Button type="button" variant="primary" onClick={onClick} disabled={disabled} className="w-full">
      {busy ? spinner : null}
      {label}
    </Button>
  );

  const loadFailedBanner = loadFailed ? (
    <p className="mx-4 rounded-md bg-error/10 px-3 py-2 text-caption-1 text-error">
      일정을 불러오지 못했어요. 새로고침 후 다시 시도해주세요.
    </p>
  ) : null;

  const weeklySection = (
    <section>
      <div className="flex items-center justify-between px-4">
        <h2 className="text-head-3 text-neutral-950">기본 촬영 가능 일정</h2>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={saveWeekly}
          disabled={disabled || loadFailed || !dirty}
        >
          {pending === 'weekly' ? spinner : null}
          저장
        </Button>
      </div>
      <Card className="mx-4 mt-2 flex flex-col divide-y divide-neutral-200">
        {DAYS.map((d) => {
          const s = days[d.key];
          return (
            <div key={d.key} className="flex items-center gap-3 px-4 py-2.5">
              <Button
                type="button"
                variant={s.enabled ? 'primary' : 'secondary'}
                aria-pressed={s.enabled}
                aria-label={`${d.label}요일 촬영 가능`}
                onClick={() => toggleDay(d.key)}
                className={cn('h-7 w-7 shrink-0 rounded-full px-0 text-body-4', !s.enabled && 'text-neutral-500')}
              >
                {d.label}
              </Button>
              <div className={cn('flex flex-1 items-center gap-2', !s.enabled && 'pointer-events-none opacity-40')}>
                <TimeSelect
                  value={s.start}
                  options={START_SLOTS}
                  disabled={!s.enabled}
                  onChange={(v) => setDayStart(d.key, v)}
                  ariaLabel={`${d.label} 시작 시간`}
                />
                <span className="text-body-6 text-neutral-500">~</span>
                <TimeSelect
                  value={s.end}
                  options={endSlotsAfter(s.start)}
                  disabled={!s.enabled}
                  onChange={(v) => setDayEnd(d.key, v)}
                  ariaLabel={`${d.label} 종료 시간`}
                />
              </div>
            </div>
          );
        })}
      </Card>
    </section>
  );

  const recurringSection = (
    <section>
      <h2 className="px-4 text-head-3 text-neutral-950">반복 예약 불가</h2>
      <Card className="mx-4 mt-2 p-4">
        {sortedRecurring.length > 0
          ? (
            <ul className="flex flex-col gap-1">
              {sortedRecurring.map((r) =>
                blockRow(
                  r,
                  'recurring-blocks',
                  `매주 ${dayLabel(r.dayOfWeek)} · ${hhmm(r.startTime)}~${hhmm(r.endTime)}`,
                ),
              )}
            </ul>
          )
          : emptyText('등록된 반복 예약 불가가 없어요.')}
        <div className="mt-3 flex flex-col gap-2 border-t border-neutral-200 pt-3">
          <div className="flex items-center gap-2">
            <Select value={recDay} onValueChange={(v) => setRecDay(v as DayOfWeek)}>
              <SelectTrigger aria-label="반복 요일" className="h-auto w-auto py-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d) => (
                  <SelectItem key={d.key} value={d.key}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TimeSelect value={recStart} options={START_SLOTS} onChange={setRecStartV} ariaLabel="반복 시작 시간" />
            <span className="text-body-6 text-neutral-500">~</span>
            <TimeSelect
              value={recEnd}
              options={endSlotsAfter(recStart)}
              onChange={setRecEnd}
              ariaLabel="반복 종료 시간"
            />
          </div>
          {addButton(addRecurring, '추가', pending === 'recurring')}
        </div>
      </Card>
    </section>
  );

  const datesSection = (
    <section>
      <h2 className="px-4 text-head-3 text-neutral-950">개인 예약 불가</h2>
      <Card className="mx-4 mt-2 p-4">
        {sortedDates.length > 0
          ? (
            <ul className="flex flex-col gap-1">
              {sortedDates.map((r) =>
                blockRow(
                  r,
                  'date-blocks',
                  `${formatKoreanDate(r.blockDate ?? '', { withWeekday: true })} · ${hhmm(r.startTime)}~${hhmm(r.endTime)}`,
                  Boolean(today && (r.blockDate ?? '') < today),
                ),
              )}
            </ul>
          )
          : emptyText('등록된 예약 불가 날짜가 없어요.')}
        <div className="mt-3 flex flex-col gap-2 border-t border-neutral-200 pt-3">
          <DateField value={blkDate} onChange={setBlkDate} min={today} ariaLabel="개인 예약불가 날짜" />
          <div className="flex items-center gap-2">
            <TimeSelect value={blkStart} options={START_SLOTS} onChange={setBlkStartV} ariaLabel="개인 예약불가 시작 시간" />
            <span className="text-body-6 text-neutral-500">~</span>
            <TimeSelect
              value={blkEnd}
              options={endSlotsAfter(blkStart)}
              onChange={setBlkEnd}
              ariaLabel="개인 예약불가 종료 시간"
            />
          </div>
          {addButton(addDate, '추가', pending === 'date')}
        </div>
      </Card>
    </section>
  );

  const deleteDialog = (
    <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            {deleteTarget?.label}
            <br />
            삭제하시겠어요?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel className="flex-1">취소</AlertDialogCancel>
          <AlertDialogAction className="flex-1 bg-danger text-neutral-0 hover:bg-danger/90" onClick={confirmDelete}>
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="flex flex-col gap-3 pb-6">
      <p className="px-4 text-caption-1 text-neutral-500">촬영 시간은 09:00~21:00, 30분 단위로 선택할 수 있어요.</p>
      {loadFailedBanner}
      {weeklySection}
      {recurringSection}
      {datesSection}
      {deleteDialog}
    </div>
  );
}
