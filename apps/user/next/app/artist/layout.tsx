import type { ReactNode } from 'react';
import { ScrollFade } from '@dearbloom/ui';
import { AppArtistBottomTab } from '@/src/components/common/AppArtistBottomTab';

export default function ArtistLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      {children}
      {/* 하단탭(60px) 위에 깔리는 스크롤 힌트 */}
      <ScrollFade offset={60} />
      <AppArtistBottomTab />
    </div>
  );
}
