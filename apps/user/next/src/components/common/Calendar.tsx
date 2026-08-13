'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@dearbloom/ui';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 'YYYY-MM' 에서 delta 개월 이동 */
function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y ?? 1970, (m ?? 1) - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const dateKey = (month: string, day: number) => `${month}-${String(day).padStart(2, '0')}`;

interface CalendarProps {
  /** 선택된 날짜 'YYYY-MM-DD'. 없으면 빈 문자열. */
  value: string;
  onChange: (date: string) => void;
  /**
   * 처음 보여줄 달 'YYYY-MM'. `value` 가 있으면 그 달이 우선한다.
   * 서버/클라이언트 시간대 차이로 첫 렌더가 어긋나지 않도록 호출하는 쪽에서 정해서 넘긴다.
   */
  defaultMonth: string;
  /** 날짜별 선택 가능 여부. 없으면 전부 선택 가능. */
  isSelectable?: (date: string) => boolean;
  /** 이동할 수 있는 가장 이른/늦은 달 'YYYY-MM'. */
  minMonth?: string;
  maxMonth?: string;
  className?: string;
}

/**
 * 월 단위 날짜 선택 그리드.
 * 문의 날짜 선택(고객)과 예약 불가 날짜 등록(작가)이 같은 모양을 쓰도록 공통화했습니다.
 */
export function Calendar({
  value,
  onChange,
  defaultMonth,
  isSelectable,
  minMonth,
  maxMonth,
  className,
}: CalendarProps) {
  const [month, setMonth] = useState(() => (value ? value.slice(0, 7) : defaultMonth));

  const [year, monthNum] = month.split('-').map(Number) as [number, number];
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const leadingBlanks = new Date(year, monthNum - 1, 1).getDay();

  const canGoPrev = !minMonth || month > minMonth;
  const canGoNext = !maxMonth || month < maxMonth;

  const monthNav = (
    <div className="flex items-center justify-between">
      <span className="text-body-2 font-semibold text-neutral-950">
        {year}년 {monthNum}월
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="이전 달"
          disabled={!canGoPrev}
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
          className="flex h-9 w-9 items-center justify-center text-neutral-950 disabled:text-neutral-300"
        >
          <ChevronLeft size={24} strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="다음 달"
          disabled={!canGoNext}
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
          className="flex h-9 w-9 items-center justify-center text-neutral-950 disabled:text-neutral-300"
        >
          <ChevronRight size={24} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );

  const grid = (
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
        const date = dateKey(month, day);
        const selectable = !isSelectable || isSelectable(date);
        const selected = value === date;

        return (
          <button
            key={date}
            type="button"
            disabled={!selectable}
            aria-pressed={selected}
            onClick={() => onChange(date)}
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

  return (
    <div className={className}>
      {monthNav}
      {grid}
    </div>
  );
}
