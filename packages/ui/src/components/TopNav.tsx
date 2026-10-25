'use client';

import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { MAIN_NAV_TABS, type NavTab } from './BottomTab';

type LinkComponent = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;

interface TopNavProps {
  /** 메뉴 탭. 하단탭과 같은 정의를 넘겨 PC/모바일 메뉴가 어긋나지 않게 합니다. */
  tabs: Pick<NavTab, 'key' | 'label' | 'href' | 'match'>[];
  /** 활성 탭 판정에 쓰는 경로. 각 탭의 `match` 가 기대하는 형태로 넘겨주세요. */
  currentPath: string;
  /** nav 의 접근성 이름. */
  label: string;
  /** 로고 이미지 경로. next 는 basePath 때문에 `/app/images/...` 를 넘깁니다. */
  logoSrc?: string;
  logoHref?: string;
  /** 로고 옆 보조 라벨(예: 작가 모드). */
  badge?: ReactNode;
  /** 우측 슬롯. */
  right?: ReactNode;
  /** 링크 컴포넌트. Next 앱은 AppLink 를 넘겨 자기 라우트만 클라이언트 라우팅합니다. */
  linkComponent?: LinkComponent;
  className?: string;
}

/**
 * PC 상단 GNB — lg(1024px) 이상에서만 보이고, 그 아래에선 하단탭이 대신합니다.
 *
 * 높이는 토큰 `gnb`(64px). 고정이라 같은 높이의 spacer 를 함께 렌더하고,
 * 다른 고정 헤더·sticky 요소는 `lg:with-gnb:top-gnb` 로 이 아래에 붙습니다
 * (`with-gnb` 는 `data-top-nav` 가 있는 페이지에서만 켜지는 variant).
 */
export function TopNav({
  tabs,
  currentPath,
  label,
  logoSrc = '/images/dearbloom-logo.svg',
  logoHref = '/snaps',
  badge,
  right,
  linkComponent,
  className,
}: TopNavProps) {
  const Link = linkComponent ?? 'a';

  const logo = (
    <div className="flex shrink-0 items-center gap-2">
      <Link href={logoHref} aria-label="DearBloom 홈" className="flex items-center">
        <img src={logoSrc} alt="DearBloom" width={132} height={19} className="h-[19px] w-[132px]" />
      </Link>
      {badge ? <span className="text-caption-1 text-neutral-600">{badge}</span> : null}
    </div>
  );

  const menu = (
    <nav aria-label={label} className="flex h-full flex-1 items-stretch gap-1">
      {tabs.map((tab) => {
        const active = tab.match(currentPath);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center border-b-2 px-4 pt-0.5 transition-colors',
              active
                ? 'border-primary text-body-3 text-primary'
                : 'border-transparent text-body-5 text-neutral-700 hover:text-neutral-950',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <header
        data-top-nav
        className={cn(
          'fixed inset-x-0 top-0 z-50 hidden h-gnb border-b border-neutral-200 bg-neutral-0 lg:block',
          className,
        )}
      >
        <div className="mx-auto flex h-full max-w-screen-xl items-center gap-10 px-10">
          {logo}
          {menu}
          {right ? <div className="flex shrink-0 items-center gap-4">{right}</div> : null}
        </div>
      </header>
      <div className="hidden h-gnb lg:block" aria-hidden />
    </>
  );
}

interface MainTopNavProps {
  /** BottomTab 과 같은 규칙. Astro 는 Astro.url.pathname, Next 는 `/app${usePathname()}`. */
  currentPath: string;
  logoSrc?: string;
  linkComponent?: LinkComponent;
  className?: string;
}

/** 고객 화면 PC GNB — 하단탭(BottomTab)과 같은 메뉴(탐색·저장·채팅·마이). */
export function MainTopNav({ currentPath, logoSrc, linkComponent, className }: MainTopNavProps) {
  return (
    <TopNav
      tabs={MAIN_NAV_TABS}
      currentPath={currentPath}
      label="주요 네비게이션"
      logoSrc={logoSrc}
      linkComponent={linkComponent}
      className={className}
    />
  );
}
