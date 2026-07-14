'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

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
    Icon: ExploreIcon,
  },
  {
    key: 'saved',
    label: '저장',
    href: '/app/saved',
    match: (p) => p.startsWith('/app/saved') || p.startsWith('/app/boards'),
    Icon: SavedIcon,
  },
  {
    key: 'my',
    label: '마이',
    href: '/app/my',
    match: (p) => p.startsWith('/app/my'),
    Icon: UserIcon,
  },
];

interface BottomTabProps {
  /** 현재 페이지 경로. Astro 는 Astro.url.pathname, Next 는 `/app${usePathname()}` 를 넘겨주세요. */
  currentPath: string;
  className?: string;
}

export function BottomTab({ currentPath, className }: BottomTabProps) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40',
        'flex h-16 items-stretch',
        'bg-neutral-0 border-t border-neutral-200',
        'pb-[env(safe-area-inset-bottom)]',
        className,
      )}
      aria-label="주요 네비게이션"
    >
      {TABS.map((tab) => {
        const active = tab.match(currentPath);
        return (
          <a
            key={tab.key}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
              active ? 'text-primary' : 'text-neutral-500 hover:text-neutral-800',
            )}
          >
            <tab.Icon active={active} />
            <span className={cn('text-caption-3', active && 'font-semibold')}>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

function ExploreIcon({ active }: { active: boolean }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx={11} cy={11} r={7} />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SavedIcon({ active }: { active: boolean }) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      width={22}
      height={22}
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
