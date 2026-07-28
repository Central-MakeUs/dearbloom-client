'use client';

import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface NumberFieldProps {
  value: number | '';
  onValueChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  /** 우측 단위 표기 (예: 원, 명, 장) */
  suffix?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/** +/- 스테퍼가 달린 숫자 입력. 직접 타이핑도 가능(숫자만). 빈 값은 ''. */
export function NumberField({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  placeholder,
  suffix,
  disabled,
  className,
  'aria-label': ariaLabel,
}: NumberFieldProps) {
  const clamp = (n: number) => {
    let v = n;
    if (max != null && v > max) v = max;
    if (min != null && v < min) v = min;
    return v;
  };
  const current = typeof value === 'number' ? value : null;
  const dec = () => onValueChange(clamp((current ?? min ?? 0) - step));
  const inc = () => onValueChange(clamp((current ?? (min != null ? min - step : 0)) + step));
  const atMin = current != null && min != null && current <= min;
  const atMax = current != null && max != null && current >= max;

  const stepBtn = 'grid h-full w-10 shrink-0 place-items-center text-neutral-500 transition-colors hover:text-neutral-900 disabled:opacity-30';

  return (
    <div
      className={cn(
        'flex h-11 items-center rounded-md border border-neutral-300 bg-neutral-0 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30',
        disabled && 'opacity-50',
        className,
      )}
    >
      <button type="button" onClick={dec} disabled={disabled || atMin} aria-label="감소" className={stepBtn}>
        <Minus className="size-4" />
      </button>
      <input
        inputMode="numeric"
        disabled={disabled}
        value={value === '' ? '' : value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '');
          onValueChange(raw === '' ? '' : clamp(Number(raw)));
        }}
        className="min-w-0 flex-1 bg-transparent text-center text-body-5 text-neutral-950 outline-none placeholder:text-neutral-400"
      />
      {suffix && <span className="shrink-0 pr-1 text-caption-1 text-neutral-500">{suffix}</span>}
      <button type="button" onClick={inc} disabled={disabled || atMax} aria-label="증가" className={stepBtn}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}
