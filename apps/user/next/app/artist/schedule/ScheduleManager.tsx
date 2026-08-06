'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { DayOfWeek, ScheduleRule } from '@dearbloom/shared';
import {
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@dearbloom/ui';
import { TimeSelect, START_SLOTS, endSlotsAfter, nextSlot } from './TimeSelect';
import { DateField } from './DateField';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'MONDAY', label: '월' },
  { key: 'TUESDAY', label: '화' },
  { key: 'WEDNESDAY', label: '수' },
  { key: 'THURSDAY', label: '목' },
  { key: 'FRIDAY', label: '금' },
  { key: 'SATURDAY', label: '토' },
  { key: 'SUNDAY', label: '일' },
];
const dayLabel = (d: DayOfWeek | null) => DAYS.find((x) => x.key === d)?.label ?? '';
const hhmm = (t: string) => t.slice(0, 5);
const hhmmss = (t: string) => (t.length === 5 ? `${t}:00` : t);

async function send(url: string, method: string, body?: unknown): Promise<boolean> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.ok;
}

const BASE = '/app/api/artist/schedule';

interface DayState {
  enabled: boolean;
  start: string;
  end: string;
}

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
      router.refresh();
    } else toast.error('저장에 실패했어요. 시간을 다시 확인해주세요.');
  };

  // 반복 예약 불가 추가 폼
  const [recDay, setRecDay] = useState<DayOfWeek>('MONDAY');
  const [recStart, setRecStart] = useState('12:00');
  const [recEnd, setRecEnd] = useState('13:00');
  const setRecStartV = (v: string) => {
    setRecStart(v);
    if (recEnd <= v) setRecEnd(nextSlot(v));
  };
  const addRecurring = async () => {
    setBusy(true);
    const ok = await send(`${BASE}/recurring-blocks`, 'POST', {
      dayOfWeek: recDay,
      startTime: hhmmss(recStart),
      endTime: hhmmss(recEnd),
    });
    setBusy(false);
    if (ok) {
      toast.success('추가되었어요.');
      router.refresh();
    } else toast.error('추가에 실패했어요.');
  };

  // 개인 예약 불가 추가 폼
  const [blkDate, setBlkDate] = useState('');
  const [blkStart, setBlkStart] = useState('09:00');
  const [blkEnd, setBlkEnd] = useState('18:00');
  const setBlkStartV = (v: string) => {
    setBlkStart(v);
    if (blkEnd <= v) setBlkEnd(nextSlot(v));
  };
  const addDate = async () => {
    if (!blkDate) { toast.error('날짜를 선택해주세요.'); return; }
    setBusy(true);
    const ok = await send(`${BASE}/date-blocks`, 'POST', {
      date: blkDate,
      startTime: hhmmss(blkStart),
      endTime: hhmmss(blkEnd),
    });
    setBusy(false);
    if (ok) {
      toast.success('추가되었어요.');
      router.refresh();
    } else toast.error('추가에 실패했어요.');
  };

  const remove = async (kind: 'recurring-blocks' | 'date-blocks', id: number) => {
    setBusy(true);
    const ok = await send(`${BASE}/${kind}?id=${id}`, 'DELETE');
    setBusy(false);
    if (ok) {
      toast.success('삭제되었어요.');
      router.refresh();
    } else toast.error('삭제에 실패했어요.');
  };

  return (
    <div className="flex flex-col gap-3 pb-6">
      <p className="px-4 text-caption-1 text-neutral-500">촬영 시간은 09:00~21:00, 30분 단위로 선택할 수 있어요.</p>

      {/* 기본 촬영 가능 일정 */}
      <section>
        <div className="flex items-center justify-between px-4">
          <h2 className="text-head-3 text-neutral-950">기본 촬영 가능 일정</h2>
          <Button type="button" variant="primary" size="sm" onClick={saveWeekly} disabled={busy}>
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
                  onClick={() => toggleDay(d.key)}
                  className="h-7 w-7 shrink-0 px-0 text-body-4"
                >
                  {d.label}
                </Button>
                <div className={`flex flex-1 items-center gap-2 ${s.enabled ? '' : 'pointer-events-none opacity-40'}`}>
                  <TimeSelect value={s.start} options={START_SLOTS} disabled={!s.enabled} onChange={(v) => setDayStart(d.key, v)} ariaLabel={`${d.label} 시작 시간`} />
                  <span className="text-body-6 text-neutral-500">~</span>
                  <TimeSelect value={s.end} options={endSlotsAfter(s.start)} disabled={!s.enabled} onChange={(v) => setDayEnd(d.key, v)} ariaLabel={`${d.label} 종료 시간`} />
                </div>
              </div>
            );
          })}
        </Card>
      </section>

      {/* 반복 예약 불가 */}
      <section>
        <h2 className="px-4 text-head-3 text-neutral-950">반복 예약 불가</h2>
        <Card className="mx-4 mt-2 p-4">
          {recurring.length > 0 && (
            <ul className="mb-3 flex flex-col gap-2">
              {recurring.map((r) => (
                <li key={r.scheduleRuleId} className="flex items-center justify-between">
                  <span className="text-body-5 text-neutral-950">매주 {dayLabel(r.dayOfWeek)} · {hhmm(r.startTime)}~{hhmm(r.endTime)}</span>
                  <Button type="button" variant="link" size="sm" onClick={() => remove('recurring-blocks', r.scheduleRuleId)} disabled={busy} className="h-auto px-0 text-caption-1 text-danger">삭제</Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={recDay} onValueChange={(v) => setRecDay(v as DayOfWeek)}>
              <SelectTrigger aria-label="반복 요일" className="h-auto w-auto py-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d) => (
                  <SelectItem key={d.key} value={d.key}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TimeSelect value={recStart} options={START_SLOTS} onChange={setRecStartV} ariaLabel="반복 시작 시간" />
            <span className="text-body-6 text-neutral-500">~</span>
            <TimeSelect value={recEnd} options={endSlotsAfter(recStart)} onChange={setRecEnd} ariaLabel="반복 종료 시간" />
            <Button type="button" variant="primary" size="sm" onClick={addRecurring} disabled={busy} className="ml-auto">추가</Button>
          </div>
        </Card>
      </section>

      {/* 개인 예약 불가 */}
      <section>
        <h2 className="px-4 text-head-3 text-neutral-950">개인 예약 불가</h2>
        <Card className="mx-4 mt-2 p-4">
          {dates.length > 0 && (
            <ul className="mb-3 flex flex-col gap-2">
              {dates.map((r) => (
                <li key={r.scheduleRuleId} className="flex items-center justify-between">
                  <span className="text-body-5 text-neutral-950">{r.blockDate} · {hhmm(r.startTime)}~{hhmm(r.endTime)}</span>
                  <Button type="button" variant="link" size="sm" onClick={() => remove('date-blocks', r.scheduleRuleId)} disabled={busy} className="h-auto px-0 text-caption-1 text-danger">삭제</Button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <DateField value={blkDate} onChange={setBlkDate} ariaLabel="개인 예약불가 날짜" />
            <TimeSelect value={blkStart} options={START_SLOTS} onChange={setBlkStartV} ariaLabel="개인 예약불가 시작 시간" />
            <span className="text-body-6 text-neutral-500">~</span>
            <TimeSelect value={blkEnd} options={endSlotsAfter(blkStart)} onChange={setBlkEnd} ariaLabel="개인 예약불가 종료 시간" />
            <Button type="button" variant="primary" size="sm" onClick={addDate} disabled={busy} className="ml-auto">추가</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
