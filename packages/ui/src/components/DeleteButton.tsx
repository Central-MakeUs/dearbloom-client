'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

interface DeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 원형 지름(px). 기본 20 (textfield clear 기준). */
  size?: number;
}

/**
 * btn_delete — 원형 X 아이콘 버튼.
 * default → neutral-400, hover → neutral-500, pressed → neutral-600.
 * TextField/SearchField 의 입력 지우기(clear) 로도 재사용됩니다.
 */
export const DeleteButton = forwardRef<HTMLButtonElement, DeleteButtonProps>(function DeleteButton(
  { size = 20, className, 'aria-label': ariaLabel = '지우기', ...rest },
  ref,
) {
  const glyph = (
    <svg
      width={size * 0.55}
      height={size * 0.55}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      {...rest}
      style={{ width: size, height: size, ...rest.style }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        'bg-neutral-400 text-neutral-0 transition-colors',
        'hover:bg-neutral-500 active:bg-neutral-600',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'disabled:opacity-40 disabled:pointer-events-none',
        className,
      )}
    >
      {glyph}
    </button>
  );
});
