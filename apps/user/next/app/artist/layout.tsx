import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { ScrollFade } from '@dearbloom/ui';
import { AppArtistBottomTab } from '@/src/components/common/AppArtistBottomTab';
import { PushTokenRegistrar } from '@/src/components/common/PushTokenRegistrar';

export default async function ArtistLayout({ children }: { children: ReactNode }) {
  const isLoggedIn = (await cookies()).has('accessToken');

  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      {children}
      {/* 하단탭(60px) 위에 깔리는 스크롤 힌트 */}
      <ScrollFade offset={60} />
      <AppArtistBottomTab />
      {/* 앱에서만 동작. 로그인 상태에서 FCM 토큰을 받아 등록한다. */}
      <PushTokenRegistrar isLoggedIn={isLoggedIn} />
    </div>
  );
}
