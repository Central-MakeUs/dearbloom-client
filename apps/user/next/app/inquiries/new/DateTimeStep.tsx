'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { cn, BottomButton } from '@dearbloom/ui';
import type { InquiryPreparation } from '@dearbloom/shared';
import { buildSlotGrid, isSelectableStart, toAvailableSet } from './slots';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

interface DateTimeStepProps {
  preparation: InquiryPreparation;
  value: { shootDate: string; startTime: string; headCount: number };
  onChange: (next: { shootDate: string; startTime: string; headCount: number }) => void;
  onNext: () => void;
}

/** 1단계 — 촬영 날짜(캘린더) / 시간(30분 격자) / 인원. */
export function DateTimeStep({ preparation, value, onChange, onNext }: DateTimeStepProps) {
  const { availability, slotStepMinutes, requiredSlotCount, minHeadCount, maxHeadCount } = preparation;

  const step = slotStepMinutes || 30;
  const required = requiredSlotCount ?? 1;
  const minCount = minHeadCount ?? 1;

  const slotGrid = useMemo(() => buildSlotGrid(step), [step]);

  /** 날짜별 가용 셀. 캘린더 활성화 판정과 시간 격자 양쪽에서 쓴다. */
  const availableByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const day of availability) map.set(day.date, toAvailableSet(day.availableTimes));
    return map;
  }, [availability]);

  /** 시작 가능한 슬롯이 하나라도 있는 날짜만 고를 수 있다(가용 셀이 있어도 소요시간이 안 들어가면 제외). */
  const selectableDates = useMemo(() => {
    const dates = new Set<string>();
    for (const [date, times] of availableByDate) {
      if (slotGrid.some((slot) => isSelectableStart(slot, times, required, step))) dates.add(date);
    }
    return dates;
  }, [availableByDate, slotGrid, required, step]);

  const months = useMemo(() => {
    const unique = [...new Set(availability.map((d) => d.date.slice(0, 7)))].sort();
    return unique.length > 0 ? unique : [new Date().toISOString().slice(0, 7)];
  }, [availability]);

  const [monthIndex, setMonthIndex] = useState(() => {
    const selected = value.shootDate.slice(0, 7);
    const found = months.indexOf(selected);
    return found >= 0 ? found : 0;
  });

  const currentMonth = months[monthIndex] ?? months[0]!;
  const [year, month] = currentMonth.split('-').map(Number) as [number, number];
  const monthStart = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = monthStart.getDay();

  const availableTimesForDate = availableByDate.get(value.shootDate) ?? new Set<string>();
  const canGoNext = !!value.shootDate && !!value.startTime;

  function selectDate(date: string) {
    // 날짜가 바뀌면 이전 시각은 그 날에 유효하지 않을 수 있어 항상 비운다.
    onChange({ ...value, shootDate: date, startTime: '' });
  }

  const monthNav = (
    <div className="flex items-center justify-between">
      <span className="text-body-2 font-semibold text-neutral-950">
        {year}년 {month}월
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="이전 달"
          disabled={monthIndex === 0}
          onClick={() => setMonthIndex((i) => i - 1)}
          className="flex h-9 w-9 items-center justify-center text-neutral-950 disabled:text-neutral-300"
        >
          <ChevronLeft size={24} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="다음 달"
          disabled={monthIndex >= months.length - 1}
          onClick={() => setMonthIndex((i) => i + 1)}
          className="flex h-9 w-9 items-center justify-center text-neutral-950 disabled:text-neutral-300"
        >
          <ChevronRight size={24} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );

  const calendarGrid = (
    <div className="mt-4 grid grid-cols-7 gap-y-2">
      {WEEKDAYS.map((w) => (
        <span key={w} className="py-2 text-center text-body-5 text-neutral-700">
          {w}
        </span>
      ))}
      {Array.from({ length: leadingBlanks }, (_, i) => (
        <span key={`blank-${i}`} aria-hidden />
      ))}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const date = toDateKey(year, month - 1, day);
        const selectable = selectableDates.has(date);
        const selected = value.shootDate === date;

        return (
          <button
            key={date}
            type="button"
            disabled={!selectable}
            onClick={() => selectDate(date)}
            className={cn(
              'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-body-3',
              selectable ? 'text-neutral-950' : 'text-neutral-300',
              selected && 'bg-primary text-neutral-0',
            )}
          >
            {day}
          </button>
        );
      })}
    </div>
  );

  const timeGrid = (
    <div className="mt-3 grid grid-cols-4 gap-2">
      {slotGrid.map((slot) => {
        const selectable =
          !!value.shootDate && isSelectableStart(slot, availableTimesForDate, required, step);
        const selected = value.startTime === slot;

        return (
          <button
            key={slot}
            type="button"
            disabled={!selectable}
            onClick={() => onChange({ ...value, startTime: slot })}
            className={cn(
              'flex h-12 items-center justify-center rounded-md text-body-4 transition-colors',
              selectable ? 'bg-neutral-0 text-neutral-950' : 'bg-neutral-200 text-neutral-400',
              selected && 'bg-primary text-neutral-0',
            )}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );

  const canDecrease = value.headCount > minCount;
  const canIncrease = maxHeadCount == null || value.headCount < maxHeadCount;

  const headCountStepper = (
    <div className="mt-3 flex h-[60px] items-center justify-between rounded-md bg-neutral-0 px-3">
      <button
        type="button"
        aria-label="인원 줄이기"
        disabled={!canDecrease}
        onClick={() => onChange({ ...value, headCount: value.headCount - 1 })}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md',
          canDecrease ? 'bg-primary text-neutral-0' : 'bg-neutral-200 text-neutral-400',
        )}
      >
        <Minus size={20} strokeWidth={2} aria-hidden />
      </button>
      <span className="text-body-3 text-neutral-950">{value.headCount}명</span>
      <button
        type="button"
        aria-label="인원 늘리기"
        disabled={!canIncrease}
        onClick={() => onChange({ ...value, headCount: value.headCount + 1 })}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md',
          canIncrease ? 'bg-primary text-neutral-0' : 'bg-neutral-200 text-neutral-400',
        )}
      >
        <Plus size={20} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-8 px-4 pb-28 pt-4">
        <section>
          <h2 className="mb-3 text-body-3 text-neutral-950">촬영 날짜를 선택해 주세요.</h2>
          {monthNav}
          {calendarGrid}
        </section>

        <section>
          <h2 className="text-body-3 text-neutral-950">촬영 시간을 선택해 주세요.</h2>
          {timeGrid}
        </section>

        <section>
          <h2 className="text-body-3 text-neutral-950">촬영 인원을 선택해 주세요.</h2>
          {headCountStepper}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md bg-neutral-100 p-4">
        <BottomButton onClick={onNext} disabled={!canGoNext}>
          다음
        </BottomButton>
      </div>
    </>
  );
}
