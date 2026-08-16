'use client';

import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { TabButton } from './TabButton';

interface Tab {
  key: string;
  label: string;
  href: string;
  match: (path: string) => boolean;
  Icon: () => ReactNode;
}

const TABS: Tab[] = [
  {
    key: 'explore',
    label: '탐색',
    href: '/snaps',
    match: (p) => p === '/' || p.startsWith('/snaps') || p.startsWith('/school') || p.startsWith('/region') || p.startsWith('/category'),
    Icon: CompassIcon,
  },
  {
    key: 'saved',
    label: '저장',
    href: '/app/saved',
    match: (p) => p.startsWith('/app/saved') || p.startsWith('/app/boards'),
    Icon: HeartIcon,
  },
  {
    key: 'chats',
    label: '채팅',
    href: '/app/chats',
    match: (p) => p.startsWith('/app/chats'),
    Icon: ChatIcon,
  },
  {
    key: 'my',
    label: '마이',
    href: '/app/my',
    match: (p) => p.startsWith('/app/my'),
    Icon: UserIcon,
  },
];

type BottomTabVariant = 'light' | 'dark';

interface BottomTabProps {
  /** 현재 페이지 경로. Astro 는 Astro.url.pathname, Next 는 `/app${usePathname()}` 를 넘겨주세요. */
  currentPath: string;
  /** 배경 변형. light(기본) → neutral-100, dark → neutral-900. */
  variant?: BottomTabVariant;
  className?: string;
  /**
   * 링크를 그릴 컴포넌트. 기본은 `<a>`(문서 이동).
   * 탐색 탭만 Astro(`/snaps`)고 나머지는 Next(`/app/*`)라, Next 앱에서는 AppLink 를
   * 넘겨 자기 라우트로 가는 탭만 클라이언트 라우팅되게 합니다.
   */
  linkComponent?: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
}

const surface = {
  light: 'bg-neutral-100 border-t border-neutral-200',
  dark: 'bg-neutral-900',
} as const satisfies Record<BottomTabVariant, string>;

// 다크 배경에선 브랜드 그린이 뭉개져 보이므로 활성 탭을 흰색으로.
const active = {
  light: 'text-primary',
  dark: 'text-neutral-0',
} as const satisfies Record<BottomTabVariant, string>;

const inactive = {
  light: 'text-neutral-400 hover:text-neutral-600',
  dark: 'text-neutral-400 hover:text-neutral-200',
} as const satisfies Record<BottomTabVariant, string>;

export function BottomTab({ currentPath, variant = 'light', className, linkComponent }: BottomTabProps) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 flex h-[60px] items-stretch',
        'pb-[var(--dearbloom-safe-area-bottom,env(safe-area-inset-bottom))]',
        surface[variant],
        className,
      )}
      aria-label="주요 네비게이션"
    >
      {TABS.map((tab) => (
        <TabButton
          key={tab.key}
          href={tab.href}
          linkComponent={linkComponent}
          label={tab.label}
          active={tab.match(currentPath)}
          activeClassName={active[variant]}
          inactiveClassName={inactive[variant]}
          icon={() => <tab.Icon />}
        />
      ))}
    </nav>
  );
}

/*
 * 아이콘은 Figma 원본(bottom_nav_bar 2293:18990)에서 그대로 가져온 패스입니다.
 * lucide 아웃라인과 모양이 달라(채움 + 안쪽이 뚫린 형태) 대체할 수 없어 인라인으로 둡니다.
 * 색은 currentColor 라 활성/비활성 클래스가 그대로 먹습니다 — 안쪽 구멍은 배경색이 비칩니다.
 */
function TabIcon({ children }: { children: ReactNode }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

function CompassIcon() {
  return (
    <TabIcon>
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path
        d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM16.7607 8.26758C17.0638 7.59371 16.3689 6.90395 15.6973 7.21191L10.4844 9.60449C10.0889 9.78603 9.77238 10.1051 9.59375 10.502L7.23926 15.7324C6.93616 16.4064 7.63105 17.0962 8.30273 16.7881L13.5156 14.3955C13.9112 14.214 14.2276 13.8949 14.4062 13.498L16.7607 8.26758Z"
        fill="currentColor"
      />
    </TabIcon>
  );
}

function HeartIcon() {
  return (
    <TabIcon>
      <path
        d="M12 7.69425C10 2.99982 3 3.49982 3 9.49985C3 15.4999 12 20.5 12 20.5C12 20.5 21 15.4999 21 9.49985C21 3.49982 14 2.99982 12 7.69425Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </TabIcon>
  );
}

function ChatIcon() {
  return (
    <TabIcon>
      <path
        d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.0667 22 8.26227 21.4501 6.73242 20.5L3.92578 21.3691C3.14035 21.6122 2.41284 20.8563 2.68652 20.0811L3.61523 17.4473C2.59483 15.8798 2 14.0098 2 12C2 6.47715 6.47715 2 12 2ZM7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13C7.55228 13 8 12.5523 8 12C8 11.4477 7.55228 11 7 11ZM12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11ZM17 11C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11Z"
        fill="currentColor"
      />
    </TabIcon>
  );
}

/** 학사모를 쓴 사람 — 졸업스냅 서비스라 일반 User 아이콘과 다릅니다. */
function UserIcon() {
  return (
    <TabIcon>
      <path
        d="M12.0001 14C7.91978 14 4.55295 17.0547 4.06173 21.002C3.99353 21.5501 4.4478 22 5.00009 22H19.0001C19.5524 22 20.0066 21.5501 19.9384 21.002C19.4472 17.0547 16.0804 14 12.0001 14Z"
        fill="currentColor"
      />
      <path
        d="M12.4473 8.7764C12.1658 8.91716 11.8344 8.91716 11.5529 8.7764L5.71563 5.85778C5.42081 5.71037 5.42081 5.28965 5.71563 5.14224L11.5529 2.22361C11.8344 2.08285 12.1658 2.08285 12.4473 2.22361L18.2845 5.14224C18.5794 5.28965 18.5794 5.71037 18.2845 5.85778L12.4473 8.7764Z"
        fill="currentColor"
      />
      <path
        d="M18.0001 5.50001C18.0001 5.22387 17.7762 5.00001 17.5001 5.00001C17.2239 5.00001 17.0001 5.22387 17.0001 5.50001V8.50001C17.0001 8.77615 17.2239 9.00001 17.5001 9.00001C17.7762 9.00001 18.0001 8.77615 18.0001 8.50001V5.50001Z"
        fill="currentColor"
      />
      <path
        d="M15.8868 8.05567C15.9601 8.35854 16.0001 8.6746 16.0001 9.00001C16.0001 11.2091 14.2092 13 12.0001 13C9.79095 13 8.00009 11.2091 8.00009 9.00001C8.00009 8.67468 8.0391 8.35847 8.11239 8.05567L11.5528 9.77638C11.8343 9.91714 12.1658 9.91714 12.4474 9.77638L15.8868 8.05567Z"
        fill="currentColor"
      />
    </TabIcon>
  );
}
