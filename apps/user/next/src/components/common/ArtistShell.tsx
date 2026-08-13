'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollFade, cn } from '@dearbloom/ui';
import { isArtistTabHidden } from './artistTab';

/**
 * 작가 화면 공통 껍데기 — 하단탭 유무에 맞춰 스크롤 페이드 위치와 하단 여백을 맞춘다.
 *
 * 탭이 뜨는 화면: 페이드는 탭(60px) 위에, 본문은 탭에 가리지 않도록 pb-20.
 * 탭이 숨는 화면: 페이드는 바닥에 붙이고 여백도 없앤다. 여백을 남기면 문서가 그만큼
 * 더 길어져서, 스크롤이 없는 화면(채팅방 등)에서도 페이드가 떠버린다.
 */
export function ArtistShell({ children }: { children: ReactNode }) {
  const tabHidden = isArtistTabHidden(usePathname() ?? '/');

  return (
    <div className={cn('min-h-screen bg-neutral-100', !tabHidden && 'pb-20')}>
      {children}
      <ScrollFade offset={tabHidden ? 0 : 60} />
    </div>
  );
}
