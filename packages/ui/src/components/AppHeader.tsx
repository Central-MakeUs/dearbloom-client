import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface AppHeaderProps {
  /**
   * 로고 이미지 경로. 원본은 `packages/ui/assets` 에 있고 빌드 시 각 앱 public 으로 복사됩니다.
   * next 는 basePath(`/app`) 아래로 서빙되므로 `/app/images/...` 를 넘겨주세요.
   */
  logoSrc?: string;
  /** 로고 클릭 시 이동할 경로. 없으면 링크 없이 이미지만 렌더. */
  logoHref?: string;
  /**
   * 검색 버튼을 띄울 경로. Astro 는 프레임워크 컴포넌트에 JSX 를 prop 으로 넘길 수 없어
   * 가장 흔한 우측 슬롯인 검색을 경로만으로 지정할 수 있게 열어둡니다.
   */
  searchHref?: string;
  /** 우측 슬롯. 지정하면 `searchHref` 대신 이쪽이 렌더됩니다. */
  right?: ReactNode;
  className?: string;
}

/**
 * app_header — 로고형 상단 앱바 (Figma 437:7469 탐색 메인 실측).
 *
 * Figma 기준 로고 헤더가 있는 화면은 탐색 메인 하나뿐입니다. 저장·마이·채팅 등
 * 나머지 화면은 탭 최상위라도 `Header`(header_title) 를 쓰세요.
 *
 * 높이 44px, bg-neutral-100, 화면 상단 고정. 로고 132x19(좌 20px) + 우측 44x44 슬롯(우 6px).
 * 고정이라 본문이 아래로 깔리므로 같은 높이의 spacer 를 함께 렌더합니다 —
 * 쓰는 쪽에서 상단 여백을 따로 챙길 필요가 없습니다.
 */
export function AppHeader({
  logoSrc = '/images/dearbloom-logo.svg',
  logoHref,
  searchHref,
  right,
  className,
}: AppHeaderProps) {
  const logoImage = (
    <img src={logoSrc} alt="dearBloom" width={132} height={19} className="h-[19px] w-[132px]" />
  );

  const logo = logoHref ? (
    <a href={logoHref} aria-label="dearBloom 홈" className="flex items-center">
      {logoImage}
    </a>
  ) : (
    logoImage
  );

  const rightContent = right ?? (searchHref ? <AppHeaderSearchLink href={searchHref} /> : null);

  const rightSlot = (
    <div className="flex h-11 min-w-11 items-center justify-end">{rightContent}</div>
  );

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 bg-neutral-100 pt-[env(safe-area-inset-top)]',
          className,
        )}
      >
        <div className="mx-auto flex h-11 max-w-md items-center justify-between pl-5 pr-1.5">
          {logo}
          {rightSlot}
        </div>
      </header>
      <div className="h-[calc(44px+env(safe-area-inset-top))]" aria-hidden />
    </>
  );
}

interface AppHeaderSearchLinkProps {
  href: string;
  className?: string;
}

/**
 * 헤더 우측 검색 버튼 (Figma 437:7733 — 44x44 터치 영역 안에 24px 아이콘).
 * lucide 의 Search 는 원 반지름이 달라 Figma 경로를 그대로 씁니다.
 */
export function AppHeaderSearchLink({ href, className }: AppHeaderSearchLinkProps) {
  return (
    <a
      href={href}
      aria-label="검색"
      className={cn('flex h-11 w-11 items-center justify-center text-neutral-800', className)}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M15 15L21 21M10 17C6.134 17 3 13.866 3 10C3 6.134 6.134 3 10 3C13.866 3 17 6.134 17 10C17 13.866 13.866 17 10 17Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
