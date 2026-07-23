'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 30분 단위 시간 슬롯 드롭다운. 네이티브 time input 대신 정해진 슬롯만 선택 가능.
 * options 로 선택 가능한 슬롯을 제한(시작<종료, 09:00~21:00 등)합니다.
 */
export function TimeSelect({
  value,
  onChange,
  options,
  disabled,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-[84px] items-center justify-between rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-body-5 text-neutral-950 disabled:opacity-40"
      >
        {value}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-30 mt-1 max-h-56 w-[84px] overflow-y-auto rounded-md border border-neutral-200 bg-neutral-0 py-1 shadow-elevation"
        >
          {options.map((o) => (
            <li key={o} role="option" aria-selected={o === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-1.5 text-left text-body-5 ${
                  o === value ? 'bg-primary-50 font-semibold text-primary' : 'text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---- 슬롯 유틸 (09:00~21:00, 30분 단위) ----

const START_HOUR = 9;
const END_HOUR = 21;
const STEP_MIN = 30;

function genSlots(): string[] {
  const slots: string[] = [];
  for (let m = START_HOUR * 60; m <= END_HOUR * 60; m += STEP_MIN) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
  }
  return slots;
}

/** 전체 슬롯 09:00 ~ 21:00 */
export const ALL_SLOTS = genSlots();
/** 시작으로 고를 수 있는 슬롯(마지막 21:00 제외 → 뒤에 종료가 있어야 함) */
export const START_SLOTS = ALL_SLOTS.slice(0, -1);
/** 시작 이후의 종료 슬롯만 */
export function endSlotsAfter(start: string): string[] {
  return ALL_SLOTS.filter((s) => s > start);
}
/** 시작 바로 다음 슬롯(종료 자동 보정용) */
export function nextSlot(start: string): string {
  const i = ALL_SLOTS.indexOf(start);
  return ALL_SLOTS[Math.min(i + 1, ALL_SLOTS.length - 1)] ?? start;
}
