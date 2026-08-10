import type { ReactNode } from 'react';
import { ScrollFade } from '@dearbloom/ui';
import { AppBottomTab } from '@/src/components/common/AppBottomTab';

export default function WithTabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      {children}
      {/* 하단탭(60px) 위에 깔리는 스크롤 힌트 */}
      <ScrollFade offset={60} />
      <AppBottomTab />
    </div>
  );
}
