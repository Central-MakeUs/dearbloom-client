'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

type BottomButtonColor = 'green' | 'black';

interface BottomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: BottomButtonColor;
}

const colorClass = {
  green: 'bg-primary text-neutral-0 hover:bg-primary-hover',
  black: 'bg-neutral-800 text-neutral-0 hover:bg-neutral-700',
} as const satisfies Record<BottomButtonColor, string>;

const bottomButtonBase =
  // gap-2 는 제출 중 스피너처럼 라벨 옆에 아이콘이 붙을 때만 의미가 있다(텍스트 하나면 무영향).
  'flex h-[52px] w-full items-center justify-center gap-2 rounded-md text-body-1 transition-colors ' +
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

/**
 * btn_bottom_share 정사각 아이콘 버튼 스타일.
 * 공유 외에 저장(하트) 등 다른 아이콘을 같은 자리에 놓을 때 재사용하세요.
 */
export const bottomIconButtonClass =
  'flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-md ' +
  'border-[1.5px] border-neutral-400 bg-neutral-100 text-neutral-800 transition-colors ' +
  'hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ' +
  'disabled:opacity-40 disabled:pointer-events-none';

type ShareButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * btn_bottom_share — 하단 바 좌측의 정사각 공유 아이콘 버튼.
 */
export const ShareButton = forwardRef<HTMLButtonElement, ShareButtonProps>(function ShareButton(
  { className, 'aria-label': ariaLabel = '공유', ...rest },
  ref,
) {
  const icon = (
    <span className="flex size-9 items-center justify-center">
      <svg aria-hidden className="size-6" fill="none" viewBox="0 0 24 24">
        <path
          d="M15 6L12 3L9 6M12 3V13M7.00023 10C6.06835 10 5.60241 10 5.23486 10.1522C4.74481 10.3552 4.35523 10.7448 4.15224 11.2349C4 11.6024 4 12.0681 4 13V17.8C4 18.9201 4 19.4798 4.21799 19.9076C4.40973 20.2839 4.71547 20.5905 5.0918 20.7822C5.5192 21 6.07899 21 7.19691 21H16.8036C17.9215 21 18.4805 21 18.9079 20.7822C19.2842 20.5905 19.5905 20.2839 19.7822 19.9076C20 19.4802 20 18.921 20 17.8031V13C20 12.0681 19.9999 11.6024 19.8477 11.2349C19.6447 10.7448 19.2554 10.3552 18.7654 10.1522C18.3978 10 17.9319 10 17 10"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    </span>
  );

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      {...rest}
      className={cn(bottomIconButtonClass, className)}
    >
      {icon}
    </button>
  );
});
