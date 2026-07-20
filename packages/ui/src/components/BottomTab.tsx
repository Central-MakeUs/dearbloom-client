'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { TabButton } from './TabButton';

interface Tab {
  key: string;
  label: string;
  href: string;
  match: (path: string) => boolean;
  Icon: (props: { active: boolean }) => ReactNode;
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
  light: 'text-neutral-600 hover:text-neutral-800',
  dark: 'text-neutral-400 hover:text-neutral-200',
} as const satisfies Record<BottomTabVariant, string>;

export function BottomTab({ currentPath, variant = 'light', className }: BottomTabProps) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 flex h-[60px] items-stretch',
        'pb-[env(safe-area-inset-bottom)]',
        surface[variant],
        className,
      )}
      aria-label="주요 네비게이션"
    >
      {TABS.map((tab) => (
        <TabButton
          key={tab.key}
          href={tab.href}
          label={tab.label}
          active={tab.match(currentPath)}
          activeClassName={active[variant]}
          inactiveClassName={inactive[variant]}
          icon={(active) => <tab.Icon active={active} />}
        />
      ))}
    </nav>
  );
}

function CompassIcon({ active }: { active: boolean }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx={12} cy={12} r={9} />
      <path d="m15.5 8.5-2 5-5 2 2-5z" fill={active ? 'currentColor' : 'none'} />
    </svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-11.9 7.8L3 21l1.7-5.1A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx={12} cy={8} r={4} />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
