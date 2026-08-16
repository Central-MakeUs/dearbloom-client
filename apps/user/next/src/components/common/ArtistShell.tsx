'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@dearbloom/ui';
import { isArtistTabHidden } from './artistTab';

/** 작가 화면 공통 껍데기 — 하단탭이 뜨는 화면은 본문이 탭에 가리지 않도록 pb-20. */
export function ArtistShell({ children }: { children: ReactNode }) {
  const tabHidden = isArtistTabHidden(usePathname() ?? '/');

  return (
    <div className={cn('min-h-screen bg-neutral-100', !tabHidden && 'pb-20')}>
      {children}
    </div>
  );
}
