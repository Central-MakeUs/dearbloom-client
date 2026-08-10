'use client';

import { Calendar } from 'lucide-react';
import { DeleteButton, buttonVariants, cn } from '@dearbloom/ui';

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
 * 네이티브 date input(mm/dd/yyyy)의 브라우저 로케일 의존 표기 대신
 * 한국어(YYYY년 M월 D일)로 표시하는 날짜 선택 필드.
 *
 * 실제 컨트롤은 투명하게 겹쳐둔 네이티브 date input 이고, 그 아래에 한국어 표기를 그립니다.
 * (숨긴 input + showPicker() 방식은 showPicker 미지원 환경 — iOS WebView 등 — 에서
 *  달력이 아예 열리지 않으므로 사용하지 않습니다.)
 * input 이 투명해 포커스가 보이지 않으므로 표기 쪽에 peer 로 포커스 링을 그립니다.
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
  const input = (
    <input
      type="date"
      value={value}
      min={min || undefined}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => {
        const el = e.currentTarget;
        // 데스크톱 크롬에서는 아이콘 영역이 보이지 않으므로 어디를 눌러도 열리게 한다.
        // 이미 피커가 떠 있는 브라우저에서 다시 호출하면 예외가 나므로 무시한다.
        try {
          el.showPicker?.();
        } catch {
          /* 네이티브 동작에 맡김 */
        }
      }}
      aria-label={ariaLabel ?? '날짜 선택'}
      className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
    />
  );

  const display = (
    <span
      aria-hidden
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'pointer-events-none w-full justify-start',
        'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40',
        disabled && 'opacity-50',
      )}
    >
      <Calendar className="text-neutral-400" aria-hidden />
      <span className={cn(value ? 'text-neutral-950' : 'text-neutral-400')}>
        {value ? formatKoreanDate(value) : placeholder}
      </span>
    </span>
  );

  const clearButton =
    value && !disabled ? (
      <DeleteButton
        aria-label="날짜 지우기"
        onClick={() => onChange('')}
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2"
      />
    ) : null;

  return (
    <div className={cn('relative', className)}>
      {input}
      {display}
      {clearButton}
    </div>
  );
}
