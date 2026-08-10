'use client';

import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../lib/cn';

interface HeaderProps {
  /** 가운데 타이틀. 없으면 타이틀 없는 변형(Variant2). */
  title?: ReactNode;
  /** 좌측 뒤로가기 핸들러. 지정 시 뒤로가기 버튼 렌더(기본 렌더). */
  onBack?: () => void;
  /**
   * 뒤로가기를 링크로 처리할 경로. 서버 컴포넌트에서 `onBack`(콜백) 대신 씁니다.
   * `onBack` 과 함께 주면 `onBack` 이 우선합니다.
   */
  backHref?: string;
  /** 뒤로가기 버튼 표시 여부. 기본 true. */
  showBack?: boolean;
  /** 우측 슬롯(메뉴/아이콘 등). */
  right?: ReactNode;
  className?: string;
}

/**
 * header_title — 뒤로가기+타이틀 상단 앱바. 하단탭 최상위 화면은 `AppHeader`(로고형)를 씁니다.
 *
 * bg-neutral-100, 높이 52px, 화면 상단 고정. 좌측 뒤로가기 + 가운데 타이틀 + 우측 슬롯.
 * 타이틀은 우측 슬롯 유무와 무관하게 항상 가운데 정렬됩니다.
 * 고정이라 본문이 아래로 깔리므로 같은 높이의 spacer 를 함께 렌더합니다 —
 * 쓰는 쪽에서 상단 여백을 따로 챙길 필요가 없습니다.
 */
// Figma icons/44/arrow/left — 44x44 터치 영역 안 28px 아이콘, 색은 neutral/n800.
const BACK_CLASS =
  'flex h-11 w-11 items-center justify-center text-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

export function Header({
  title,
  onBack,
  backHref,
  showBack = true,
  right,
  className,
}: HeaderProps) {
  const backIcon = <ChevronLeft size={28} strokeWidth={2} aria-hidden />;

  const backButton = !showBack ? (
    <span className="h-11 w-11" aria-hidden />
  ) : onBack || !backHref ? (
    <button type="button" onClick={onBack} aria-label="뒤로가기" className={BACK_CLASS}>
      {backIcon}
    </button>
  ) : (
    <a href={backHref} aria-label="뒤로가기" className={BACK_CLASS}>
      {backIcon}
    </a>
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
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 bg-neutral-100 pt-[env(safe-area-inset-top)]',
          className,
        )}
      >
        {/* 좌우 4px 은 Figma header_title 실측(아이콘 44x44 가 각각 x=4, x=327, 프레임 375). */}
        <div className="relative mx-auto flex h-[52px] max-w-md items-center justify-between px-1">
          {backButton}
          {titleNode}
          {rightSlot}
        </div>
      </header>
      <div className="h-[calc(52px+env(safe-area-inset-top))]" aria-hidden />
    </>
  );
}
