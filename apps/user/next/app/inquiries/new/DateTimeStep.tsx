'use client';

import { useMemo } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn, BottomButton } from '@dearbloom/ui';
import type { InquiryPreparation } from '@dearbloom/shared';
import { Calendar } from '@/src/components/common/Calendar';
import { buildSlotGrid, isSelectableStart, toAvailableSet } from '@/src/lib/slots';

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

  /** 예약 가능 데이터가 있는 달 범위 — 이 범위 밖으로는 이동시키지 않는다. */
  const months = useMemo(() => [...new Set(availability.map((d) => d.date.slice(0, 7)))].sort(), [availability]);

  const availableTimesForDate = availableByDate.get(value.shootDate) ?? new Set<string>();
  const canGoNext = !!value.shootDate && !!value.startTime;

  function selectDate(date: string) {
    // 날짜가 바뀌면 이전 시각은 그 날에 유효하지 않을 수 있어 항상 비운다.
    onChange({ ...value, shootDate: date, startTime: '' });
  }

  const calendar = months.length > 0 && (
    <Calendar
      value={value.shootDate}
      onChange={selectDate}
      defaultMonth={months[0]!}
      minMonth={months[0]}
      maxMonth={months.at(-1)}
      isSelectable={(date) => selectableDates.has(date)}
    />
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
          {calendar}
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
