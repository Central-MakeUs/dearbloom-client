import type { ReactNode } from 'react';
import { cn } from '@dearbloom/ui';

interface ChatSplitLayoutProps {
  /** 왼쪽 패널(채팅 목록). 없으면 오른쪽 패널만 가운데에 둔다. */
  sidebar?: ReactNode;
  /** PC 에서 사이드바 맨 위에 붙일 제목. 페이지 헤더가 이미 제목을 보여주면 생략. */
  sidebarTitle?: string;
  /** 모바일에서도 사이드바를 보여줄지. 목록 화면은 true(목록이 곧 본문), 채팅방은 false. */
  showSidebarOnMobile?: boolean;
  /** 페이지에 고정 헤더(52px)가 있어 그 아래에서 시작하는지. PC 패널 높이 계산에 쓴다. */
  belowHeader?: boolean;
  children: ReactNode;
}

/**
 * 채팅 PC(lg 이상) 2단 틀 — 왼쪽 채팅 목록 + 오른쪽 대화.
 *
 * 모바일에선 레이아웃을 건드리지 않는다: 오른쪽 패널 래퍼는 `contents` 라 children 이
 * 원래 자리 그대로 그려지고, 사이드바는 `showSidebarOnMobile` 일 때만 보인다.
 */
export function ChatSplitLayout({
  sidebar,
  sidebarTitle,
  showSidebarOnMobile = false,
  belowHeader = false,
  children,
}: ChatSplitLayoutProps) {
  const aside = sidebar ? (
    <aside
      aria-label="채팅 목록"
      className={cn(
        'lg:block lg:w-[320px] lg:shrink-0 lg:overflow-y-auto lg:rounded-l-lg lg:border lg:border-r-0 lg:border-neutral-200 lg:bg-neutral-0 lg:pb-5',
        !showSidebarOnMobile && 'hidden',
      )}
    >
      {sidebarTitle ? (
        <h2 className="hidden px-4 pt-5 text-head-3 text-neutral-950 lg:block">{sidebarTitle}</h2>
      ) : null}
      {sidebar}
    </aside>
  ) : null;

  const pane = (
    <div
      className={cn(
        'contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:overflow-hidden lg:border lg:border-neutral-200 lg:bg-neutral-100',
        sidebar ? 'lg:rounded-r-lg' : 'lg:rounded-lg',
      )}
    >
      {children}
    </div>
  );

  return (
    <div className="lg:bg-neutral-100">
      <div
        className={cn(
          'lg:mx-auto lg:flex lg:max-w-screen-lg lg:px-10 lg:py-6',
          belowHeader ? 'lg:h-[calc(100dvh-theme(spacing.gnb)-52px)]' : 'lg:h-[calc(100dvh-theme(spacing.gnb))]',
        )}
      >
        {aside}
        {pane}
      </div>
    </div>
  );
}

/** PC 목록 화면의 오른쪽 빈 패널 — 아직 고른 대화가 없을 때. 모바일에선 숨는다. */
export function ChatEmptyPane() {
  return (
    <div className="hidden flex-1 flex-col items-center justify-center gap-2 text-center lg:flex">
      <p className="text-body-1 text-neutral-950">대화를 선택해 주세요</p>
      <p className="text-body-6 text-neutral-700">왼쪽 목록에서 채팅방을 고르면 여기에서 이어서 대화할 수 있어요.</p>
    </div>
  );
}
