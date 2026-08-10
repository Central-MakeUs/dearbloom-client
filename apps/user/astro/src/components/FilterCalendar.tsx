import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 'YYYY-MM-DD' (로컬 기준). toISOString 은 UTC 로 밀려 하루 어긋날 수 있어 직접 만듭니다. */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Props {
  /** 보여줄 달의 1일 */
  month: Date;
  onMonthChange: (month: Date) => void;
  /** 선택된 기간. 시작만 고른 중간 상태면 end 는 null. */
  start: string | null;
  end: string | null;
  onSelect: (date: string) => void;
  /** 이 날짜 이전은 고를 수 없습니다(보통 오늘). */
  minDate: string;
}

/**
 * 기간 선택 캘린더 — Figma 1083:15228 실측. 셀 40x40, 선택은 primary 원.
 * 범위 안의 날짜를 모두 원으로 칠합니다(시안 기준). 회색 처리는 과거와 다른 달입니다.
 */
export function FilterCalendar({ month, onMonthChange, start, end, onSelect, minDate }: Props) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // 달력 격자는 그 달 1일이 속한 주의 일요일부터 6주(42칸)를 항상 채웁니다 — 높이가 달마다 흔들리지 않게.
  const gridStart = new Date(year, monthIndex, 1);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const prevMonth = new Date(year, monthIndex - 1, 1);
  // 이번 달의 마지막 날이 minDate 보다 이르면 그 달엔 고를 수 있는 날이 없습니다.
  const canGoPrev = toDateKey(new Date(year, monthIndex, 0)) >= minDate;

  const header = (
    <div className="flex h-9 items-center justify-between">
      <span className="text-body-1 text-neutral-900">
        {year}년 {monthIndex + 1}월
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => canGoPrev && onMonthChange(prevMonth)}
          disabled={!canGoPrev}
          aria-label="이전 달"
          className="flex h-9 w-9 items-center justify-center"
        >
          <ChevronLeft
            size={24}
            strokeWidth={1.8}
            className={canGoPrev ? 'text-neutral-800' : 'text-neutral-400'}
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
          aria-label="다음 달"
          className="flex h-9 w-9 items-center justify-center"
        >
          <ChevronRight size={24} strokeWidth={1.8} className="text-neutral-800" aria-hidden />
        </button>
      </div>
    </div>
  );

  const weekdayRow = (
    <div className="grid grid-cols-7">
      {WEEKDAYS.map((w) => (
        <span key={w} className="mx-auto flex h-10 w-10 items-center justify-center text-body-2 text-neutral-800">
          {w}
        </span>
      ))}
    </div>
  );

  const dayCells = cells.map((d) => {
    const key = toDateKey(d);
    const outside = d.getMonth() !== monthIndex;
    const disabled = key < minDate || outside;
    // 시작만 고른 중간 상태에서는 그 하루만 칠합니다.
    // 다른 달 칸은 범위에 들어도 칠하지 않습니다 — 30일처럼 달을 넘기는 기간에서
    // 회색 숫자에 초록 원이 씌워져 이 달에 속한 날짜처럼 보이기 때문입니다.
    const selected =
      !outside && start !== null && (end === null ? key === start : key >= start && key <= end);

    return (
      <button
        key={key}
        type="button"
        disabled={disabled}
        onClick={() => onSelect(key)}
        aria-pressed={selected}
        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${
          selected
            ? 'bg-primary text-body-1 font-semibold text-neutral-0'
            : disabled
              ? 'text-body-2 text-neutral-400'
              : 'text-body-1 text-neutral-950'
        }`}
      >
        {d.getDate()}
      </button>
    );
  });

  return (
    <div className="flex flex-col gap-2">
      {header}
      <div className="flex flex-col gap-3">
        {weekdayRow}
        <div className="grid grid-cols-7 gap-y-1">{dayCells}</div>
      </div>
    </div>
  );
}
