'use client';

import { useRef } from 'react';

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
      <button
        type="button"
        onClick={openPicker}
        aria-label={ariaLabel ?? '날짜 선택'}
        className="flex items-center gap-2 rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-body-5 text-neutral-950"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span className={value ? 'text-neutral-950' : 'text-neutral-400'}>{value ? formatKorean(value) : placeholder}</span>
      </button>
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
