import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { AppArtistBottomTab } from '@/src/components/common/AppArtistBottomTab';
import { ArtistShell } from '@/src/components/common/ArtistShell';
import { PushTokenRegistrar } from '@/src/components/common/PushTokenRegistrar';

export default async function ArtistLayout({ children }: { children: ReactNode }) {
  const isLoggedIn = (await cookies()).has('accessToken');

  return (
    <ArtistShell>
      {children}
      <AppArtistBottomTab />
      {/* 앱에서만 동작. 로그인 상태에서 FCM 토큰을 받아 등록한다. */}
      <PushTokenRegistrar isLoggedIn={isLoggedIn} />
    </ArtistShell>
  );
}
