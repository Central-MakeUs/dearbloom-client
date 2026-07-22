'use client';

import { usePathname } from 'next/navigation';
import { TabButton } from '@dearbloom/ui';

/**
 * 작가 전용 하단 탭. IA 도메인(대시보드/신청/작품/채팅/마이) 기준.
 * 포인트는 대시보드·마이에서 접근. 폼/상세 화면에선 숨겨집니다.
 * usePathname() 은 basePath('/app') 를 제외한 경로('/artist/...')를 반환합니다.
 */
const TABS = [
  { key: 'home', label: '홈', href: '/app/artist/dashboard', match: (p: string) => p.startsWith('/artist/dashboard') || p.startsWith('/artist/schedule'), Icon: HomeIcon },
  { key: 'requests', label: '신청', href: '/app/artist/requests', match: (p: string) => p.startsWith('/artist/requests'), Icon: InboxIcon },
  { key: 'products', label: '작품', href: '/app/artist/products', match: (p: string) => p.startsWith('/artist/products'), Icon: GridIcon },
  { key: 'chats', label: '채팅', href: '/app/artist/chats', match: (p: string) => p.startsWith('/artist/chats'), Icon: ChatIcon },
  { key: 'my', label: '마이', href: '/app/artist/my', match: (p: string) => p.startsWith('/artist/my') || p.startsWith('/artist/profile'), Icon: UserIcon },
];

/** 폼/상세 화면에서는 하단탭 숨김(자체 CTA/뒤로가기 사용). */
function isHidden(p: string): boolean {
  if (p.includes('/artist/products/new')) return true;
  if (p.includes('/artist/products/') && p.endsWith('/edit')) return true;
  if (p.startsWith('/artist/profile')) return true;
  if (/^\/artist\/chats\/.+/.test(p)) return true;
  return false;
}

export function AppArtistBottomTab() {
  const pathname = usePathname() ?? '/';
  if (isHidden(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-[60px] items-stretch border-t border-neutral-200 bg-neutral-100 pb-[env(safe-area-inset-bottom)]"
      aria-label="작가 네비게이션"
    >
      {TABS.map((tab) => (
        <TabButton
          key={tab.key}
          href={tab.href}
          label={tab.label}
          active={tab.match(pathname)}
          icon={(active) => <tab.Icon active={active} />}
        />
      ))}
    </nav>
  );
}

function svgProps(active: boolean) {
  return {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: active ? 2.2 : 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg {...svgProps(active)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" fill={active ? 'currentColor' : 'none'} stroke={active ? 'none' : 'currentColor'} />
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg {...svgProps(active)}>
      <path d="M4 13h4l1.5 2.5h5L16 13h4" />
      <path d="M4 13 6 5h12l2 8v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" fill={active ? 'currentColor' : 'none'} />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg {...svgProps(active)} fill={active ? 'currentColor' : 'none'}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg {...svgProps(active)} fill={active ? 'currentColor' : 'none'}>
      <path d="M21 11.5a8.5 8.5 0 0 1-11.9 7.8L3 21l1.7-5.1A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg {...svgProps(active)} fill={active ? 'currentColor' : 'none'}>
      <circle cx={12} cy={8} r={4} />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
