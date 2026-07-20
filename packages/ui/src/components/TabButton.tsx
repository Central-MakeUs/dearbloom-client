'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

interface TabButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  label: ReactNode;
  active?: boolean;
  /** active 여부에 따라 아이콘을 그리는 렌더 함수. */
  icon: (active: boolean) => ReactNode;
  /** 활성 라벨/아이콘 색 클래스. 기본 브랜드 그린(라이트 배경용). 다크 배경에선 흰색 등으로 조정. */
  activeClassName?: string;
  /** 비활성 라벨/아이콘 색 클래스(다크 배경 등에서 조정). 기본 neutral-600. */
  inactiveClassName?: string;
}

/**
 * tab_btn — 하단 탭 1개.
 * 아이콘(24) + 라벨(caption-3). selected → 브랜드 그린, default → neutral-600.
 * 라우팅을 담고 있는 {@link BottomTab} 이 조합해서 사용합니다.
 */
export function TabButton({
  label,
  active = false,
  icon,
  activeClassName = 'text-primary',
  inactiveClassName = 'text-neutral-600 hover:text-neutral-800',
  className,
  ...rest
}: TabButtonProps) {
  return (
    <a
      {...rest}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
        active ? activeClassName : inactiveClassName,
        className,
      )}
    >
      {icon(active)}
      <span className={cn('text-caption-3', active && 'font-semibold')}>{label}</span>
    </a>
  );
}
