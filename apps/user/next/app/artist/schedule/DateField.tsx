'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { BottomSheet, DeleteButton, buttonVariants, cn } from '@dearbloom/ui';
import { Calendar } from '@/src/components/common/Calendar';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 'YYYY-MM-DD' → 'YYYY년 M월 D일'. `withWeekday` 면 '(월)' 까지 붙입니다.
 * 요일은 로컬 생성자로 계산하므로 서버/클라이언트 시간대가 달라도 같은 값이 나옵니다.
 */
export function formatKoreanDate(iso: string, { withWeekday = false } = {}): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const base = `${y}년 ${m}월 ${d}일`;
  return withWeekday ? `${base}(${WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()]})` : base;
}

/**
 * 날짜 선택 필드 — 누르면 바텀시트로 공통 캘린더를 띄웁니다.
 * (네이티브 date input 은 브라우저마다 모양이 제각각이고 디자인 토큰도 못 입혀서 쓰지 않습니다)
 */
export function DateField({
  value,
  onChange,
  placeholder = '날짜 선택',
  ariaLabel,
  min,
  disabled,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  /** 선택 가능한 가장 이른 날짜('YYYY-MM-DD'). */
  min?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen(true)}
      aria-label={ariaLabel ?? '날짜 선택'}
      className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start', value && 'pr-11')}
    >
      <CalendarIcon className="text-neutral-400" aria-hidden />
      <span className={cn(value ? 'text-neutral-950' : 'text-neutral-400')}>
        {value ? formatKoreanDate(value) : placeholder}
      </span>
    </button>
  );

  const clearButton =
    value && !disabled ? (
      <DeleteButton
        aria-label="날짜 지우기"
        onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      />
    ) : null;

  // 값이 없으면 min(대개 오늘)의 달부터 보여준다.
  const defaultMonth = (value || min || '').slice(0, 7);

  const sheet = (
    <BottomSheet open={open} onOpenChange={setOpen} title={ariaLabel ?? '날짜 선택'}>
      <div className="px-4 pt-2">
        <h2 className="text-body-3 text-neutral-950">날짜를 선택해 주세요.</h2>
        {defaultMonth && (
          <Calendar
            value={value}
            onChange={(d) => {
              onChange(d);
              setOpen(false);
            }}
            defaultMonth={defaultMonth}
            minMonth={min ? min.slice(0, 7) : undefined}
            isSelectable={min ? (d) => d >= min : undefined}
            className="pb-2"
          />
        )}
      </div>
    </BottomSheet>
  );

  return (
    <div className={cn('relative', className)}>
      {trigger}
      {clearButton}
      {sheet}
    </div>
  );
}
