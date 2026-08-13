'use client';

import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';
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
  /**
   * 링크를 그릴 컴포넌트. 기본은 `<a>`(문서 이동).
   * Next 앱은 자기 라우트로 가는 탭을 클라이언트 라우팅하려고 AppLink 를 넘깁니다.
   * Astro 는 넘기지 않습니다 — 어차피 문서 이동뿐입니다.
   */
  linkComponent?: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
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
  linkComponent,
  href = '',
  ...rest
}: TabButtonProps) {
  const Anchor = linkComponent ?? 'a';

  return (
    <Anchor
      href={href}
      {...rest}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
        active ? activeClassName : inactiveClassName,
        className,
      )}
    >
      {icon(active)}
      {/* 시안(Caption3_r_11)은 선택 여부와 무관하게 400 — 색으로만 구분한다. */}
      <span className="text-caption-3">{label}</span>
    </Anchor>
  );
}
