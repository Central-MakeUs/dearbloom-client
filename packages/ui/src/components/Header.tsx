'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface HeaderProps {
  /** 가운데 타이틀. 없으면 타이틀 없는 변형(Variant2). */
  title?: ReactNode;
  /** 좌측 뒤로가기 핸들러. 지정 시 뒤로가기 버튼 렌더(기본 렌더). */
  onBack?: () => void;
  /** 뒤로가기 버튼 표시 여부. 기본 true. */
  showBack?: boolean;
  /** 우측 슬롯(메뉴/아이콘 등). */
  right?: ReactNode;
  className?: string;
}

/**
 * header_title — 상단 앱바.
 * bg-neutral-100, 높이 52px. 좌측 뒤로가기 + 가운데 타이틀(head-2) + 우측 슬롯.
 * 타이틀은 우측 슬롯 유무와 무관하게 항상 가운데 정렬됩니다.
 */
export function Header({ title, onBack, showBack = true, right, className }: HeaderProps) {
  const backButton = showBack ? (
    <button
      type="button"
      onClick={onBack}
      aria-label="뒤로가기"
      className="flex h-11 w-11 items-center justify-center text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  ) : (
    <span className="h-11 w-11" aria-hidden />
  );

  const titleNode = title ? (
    <h1 className="pointer-events-none absolute inset-x-0 mx-auto w-max max-w-[60%] truncate text-center text-head-3 text-neutral-950">
      {title}
    </h1>
  ) : null;

  const rightSlot = (
    <div className="flex h-12 min-w-12 items-center justify-end">{right}</div>
  );

  return (
    <header
      className={cn(
        'relative flex h-[52px] w-full items-center justify-between bg-neutral-100 px-2',
        className,
      )}
    >
      {backButton}
      {titleNode}
      {rightSlot}
    </header>
  );
}
