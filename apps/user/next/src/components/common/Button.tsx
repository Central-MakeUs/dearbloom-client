'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@dearbloom/ui';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** false 로 두면 화살표를 렌더링하지 않음. ReactNode 를 넣으면 그 노드로 대체. */
  icon?: ReactNode | false;
}

const base = {
  primary: 'bg-primary text-neutral-0',
  secondary: 'bg-neutral-100 text-primary',
  ghost: 'bg-transparent text-primary border border-primary',
  dark: 'bg-neutral-950 text-neutral-0',
} as const satisfies Record<ButtonVariant, string>;

const slide = {
  primary: 'bg-primary-800',
  secondary: 'bg-primary text-neutral-0',
  ghost: 'bg-primary text-neutral-0',
  dark: 'bg-primary',
} as const satisfies Record<ButtonVariant, string>;

const size = {
  sm: { padding: 'px-4 py-2', text: 'text-caption-1', gap: 'gap-1.5', icon: 14 },
  md: { padding: 'px-6 py-3', text: 'text-body-3', gap: 'gap-2', icon: 16 },
  lg: { padding: 'px-8 py-4', text: 'text-body-1', gap: 'gap-2.5', icon: 18 },
} as const satisfies Record<ButtonSize, { padding: string; text: string; gap: string; icon: number }>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size: sizeProp = 'md', icon, className, children, ...rest },
  ref,
) {
  const s = size[sizeProp];
  const showIcon = icon !== false;
  const iconNode = icon === undefined || icon === true ? <ArrowIcon size={s.icon} /> : icon;

  // hover 시 뒤에서 슬라이드해서 올라오는 배경
  const slideLayer = (
    <span
      aria-hidden
      className={cn(
        'absolute inset-0 rounded-full translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'group-hover:translate-y-0 group-focus-visible:translate-y-0',
        slide[variant],
      )}
    />
  );

  // 텍스트 롤업: 위의 텍스트가 올라가고 아래에서 복제본이 올라와 자리 잡음
  const label = (
    <span className="relative inline-block overflow-hidden">
      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute left-0 top-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
      >
        {children}
      </span>
    </span>
  );

  const iconSlot = showIcon ? (
    <span className="relative inline-flex overflow-hidden">
      <span className="inline-flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-4 group-hover:-translate-y-4 group-focus-visible:translate-x-4 group-focus-visible:-translate-y-4">
        {iconNode}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 inline-flex -translate-x-4 translate-y-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0"
      >
        {iconNode}
      </span>
    </span>
  ) : null;

  const content = (
    <span className={cn('relative z-10 inline-flex items-center', s.gap)}>
      {label}
      {iconSlot}
    </span>
  );

  return (
    <button
      ref={ref}
      {...rest}
      className={cn(
        'group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full',
        'transition-transform duration-200 ease-out will-change-transform',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
        'active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none',
        base[variant],
        s.padding,
        s.text,
        className,
      )}
    >
      {slideLayer}
      {content}
    </button>
  );
});

function ArrowIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
