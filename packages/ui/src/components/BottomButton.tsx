'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

type BottomButtonColor = 'green' | 'black';

interface BottomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: BottomButtonColor;
}

const colorClass = {
  green: 'bg-primary text-neutral-0 hover:bg-primary-600',
  black: 'bg-neutral-800 text-neutral-0 hover:bg-neutral-700',
} as const satisfies Record<BottomButtonColor, string>;

const bottomButtonBase =
  'flex h-[52px] w-full items-center justify-center rounded-md text-body-1 transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ' +
  'active:scale-[0.99] disabled:bg-neutral-300 disabled:text-neutral-500 disabled:pointer-events-none';

/**
 * btn_bottom — 화면 하단 고정 CTA 버튼.
 * color green(브랜드 그린) / black. disabled 시 neutral-300 배경 + neutral-500 텍스트.
 * 공유 아이콘이 함께 붙는 2area 레이아웃은 {@link BottomButtonBar} 를 사용하세요.
 */
export const BottomButton = forwardRef<HTMLButtonElement, BottomButtonProps>(function BottomButton(
  { color = 'green', type = 'button', className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={cn(bottomButtonBase, colorClass[color], className)}
    >
      {children}
    </button>
  );
});

interface BottomButtonBarProps {
  /** 좌측 공유(또는 기타) 아이콘 버튼 슬롯. */
  leading?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * btn_bottom_2area — 좌측 아이콘(공유 등) + 우측 CTA 조합.
 * children 으로 {@link BottomButton} 을 넘기면 남은 폭을 채웁니다.
 */
export function BottomButtonBar({ leading, className, children }: BottomButtonBarProps) {
  return (
    <div className={cn('flex w-full items-stretch gap-2', className)}>
      {leading}
      <div className="flex-1">{children}</div>
    </div>
  );
}

type ShareButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * btn_bottom_share — 하단 바 좌측의 정사각 공유 아이콘 버튼.
 */
export const ShareButton = forwardRef<HTMLButtonElement, ShareButtonProps>(function ShareButton(
  { className, 'aria-label': ariaLabel = '공유', ...rest },
  ref,
) {
  const icon = (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx={18} cy={5} r={3} />
      <circle cx={6} cy={12} r={3} />
      <circle cx={18} cy={19} r={3} />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      {...rest}
      className={cn(
        'flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-md',
        'border border-neutral-400 bg-neutral-100 text-neutral-700 transition-colors',
        'hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'disabled:opacity-40 disabled:pointer-events-none',
        className,
      )}
    >
      {icon}
    </button>
  );
});
