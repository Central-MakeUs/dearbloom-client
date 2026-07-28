'use client';

import { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { Button, cn } from '@dearbloom/ui';

/** 'YYYY-MM-DD' → 'YYYY년 M월 D일' */
function formatKorean(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

/**
 * 네이티브 date input(mm/dd/yyyy)의 브라우저 로케일 의존 표기 대신
 * 한국어(YYYY년 M월 D일)로 표시하는 날짜 선택 필드.
 * 실제 선택 UI는 숨겨둔 네이티브 달력(showPicker)을 그대로 사용합니다.
 */
export function DateField({
  value,
  onChange,
  placeholder = '날짜 선택',
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') el.showPicker();
    else el.focus();
  };

  return (
    <div className="relative">
      <Button type="button" variant="outline" onClick={openPicker} aria-label={ariaLabel ?? '날짜 선택'}>
        <Calendar className="text-neutral-400" aria-hidden />
        <span className={cn(value ? 'text-neutral-950' : 'text-neutral-400')}>
          {value ? formatKorean(value) : placeholder}
        </span>
      </Button>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel ?? '날짜 선택'}
        className="sr-only"
        tabIndex={-1}
      />
    </div>
  );
}
