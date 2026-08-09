'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
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

async function send(url: string, method: string, body?: unknown): Promise<boolean> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.ok;
}

const BASE = '/app/api/artist/schedule';

type BlockKind = 'recurring-blocks' | 'date-blocks';

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

export function ScheduleManager({
  weekly,
  recurring,
  dates,
}: {
  weekly: ScheduleRule[];
  recurring: ScheduleRule[];
  dates: ScheduleRule[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const disabled = busy || refreshing;

  // 서버/클라이언트 시각 차이로 인한 hydration 불일치를 피하려고 마운트 후에 채운다.
  const [today, setToday] = useState('');
  useEffect(() => setToday(todayISO()), []);

  const refresh = () => startRefresh(() => router.refresh());

  // 기본 촬영 가능 일정 — 요일별 상태
  const [days, setDays] = useState<Record<DayOfWeek, DayState>>(() => {
    const init = {} as Record<DayOfWeek, DayState>;
    for (const d of DAYS) {
      const rule = weekly.find((w) => w.dayOfWeek === d.key);
      init[d.key] = rule
        ? { enabled: true, start: hhmm(rule.startTime), end: hhmm(rule.endTime) }
        : { enabled: false, start: '09:00', end: '18:00' };
    }
    return init;
  });

  const toggleDay = (key: DayOfWeek) =>
    setDays((p) => ({ ...p, [key]: { ...p[key], enabled: !p[key].enabled } }));
  const setDayStart = (key: DayOfWeek, v: string) =>
    setDays((p) => ({ ...p, [key]: { ...p[key], start: v, end: p[key].end <= v ? nextSlot(v) : p[key].end } }));
  const setDayEnd = (key: DayOfWeek, v: string) => setDays((p) => ({ ...p, [key]: { ...p[key], end: v } }));

  const saveWeekly = async () => {
    setBusy(true);
    const availabilityList = DAYS.filter((d) => days[d.key].enabled).map((d) => ({
      dayOfWeek: d.key,
      startTime: hhmmss(days[d.key].start),
      endTime: hhmmss(days[d.key].end),
    }));
    const ok = await send(`${BASE}/weekly`, 'PUT', { availabilityList });
    setBusy(false);
    if (ok) {
      toast.success('저장되었어요.');
      refresh();
    } else toast.error('저장에 실패했어요. 시간을 다시 확인해주세요.');
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
    setBusy(true);
    const ok = await send(`${BASE}/recurring-blocks`, 'POST', {
      dayOfWeek: recDay,
      startTime: hhmmss(recStart),
      endTime: hhmmss(recEnd),
    });
    setBusy(false);
    if (ok) {
      toast.success('추가되었어요.');
      setRecDay(REC_DEFAULT.day);
      setRecStart(REC_DEFAULT.start);
      setRecEnd(REC_DEFAULT.end);
      refresh();
    } else toast.error('추가에 실패했어요.');
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
    setBusy(true);
    const ok = await send(`${BASE}/date-blocks`, 'POST', {
      date: blkDate,
      startTime: hhmmss(blkStart),
      endTime: hhmmss(blkEnd),
    });
    setBusy(false);
    if (ok) {
      toast.success('추가되었어요.');
      setBlkDate('');
      setBlkStart(BLK_DEFAULT.start);
      setBlkEnd(BLK_DEFAULT.end);
      refresh();
    } else toast.error('추가에 실패했어요.');
  };

  // 삭제 — 확인 후 실행
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { kind, id } = deleteTarget;
    setDeleteTarget(null);
    setBusy(true);
    const ok = await send(`${BASE}/${kind}?id=${id}`, 'DELETE');
    setBusy(false);
    if (ok) {
      toast.success('삭제되었어요.');
      refresh();
    } else toast.error('삭제에 실패했어요.');
  };

  const sortedRecurring = [...recurring].sort(
    (a, b) => dayIndex(a.dayOfWeek) - dayIndex(b.dayOfWeek) || a.startTime.localeCompare(b.startTime),
  );
  const sortedDates = [...dates].sort(
    (a, b) => (a.blockDate ?? '').localeCompare(b.blockDate ?? '') || a.startTime.localeCompare(b.startTime),
  );

  const emptyText = (text: string) => <p className="py-2 text-center text-caption-1 text-neutral-500">{text}</p>;

  const blockRow = (r: ScheduleRule, kind: BlockKind, label: string) => (
    <li key={r.scheduleRuleId} className="flex items-center justify-between gap-2">
      <span className="text-body-5 text-neutral-950">{label}</span>
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

  const weeklySection = (
    <section>
      <div className="flex items-center justify-between px-4">
        <h2 className="text-head-3 text-neutral-950">기본 촬영 가능 일정</h2>
        <Button type="button" variant="primary" size="sm" onClick={saveWeekly} disabled={disabled}>
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
        {sortedRecurring.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {sortedRecurring.map((r) =>
              blockRow(r, 'recurring-blocks', `매주 ${dayLabel(r.dayOfWeek)} · ${hhmm(r.startTime)}~${hhmm(r.endTime)}`),
            )}
          </ul>
        ) : (
          emptyText('등록된 반복 예약 불가가 없어요.')
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3">
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
          <TimeSelect value={recEnd} options={endSlotsAfter(recStart)} onChange={setRecEnd} ariaLabel="반복 종료 시간" />
          <Button type="button" variant="primary" size="sm" onClick={addRecurring} disabled={disabled} className="ml-auto">
            추가
          </Button>
        </div>
      </Card>
    </section>
  );

  const datesSection = (
    <section>
      <h2 className="px-4 text-head-3 text-neutral-950">개인 예약 불가</h2>
      <Card className="mx-4 mt-2 p-4">
        {sortedDates.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {sortedDates.map((r) =>
              blockRow(
                r,
                'date-blocks',
                `${formatKoreanDate(r.blockDate ?? '')} · ${hhmm(r.startTime)}~${hhmm(r.endTime)}`,
              ),
            )}
          </ul>
        ) : (
          emptyText('등록된 예약 불가 날짜가 없어요.')
        )}
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
            <Button type="button" variant="primary" size="sm" onClick={addDate} disabled={disabled} className="ml-auto">
              추가
            </Button>
          </div>
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
      {weeklySection}
      {recurringSection}
      {datesSection}
      {deleteDialog}
    </div>
  );
}
