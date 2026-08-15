import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { AppBottomTab } from '@/src/components/common/AppBottomTab';
import { PushTokenRegistrar } from '@/src/components/common/PushTokenRegistrar';

export default async function WithTabLayout({ children }: { children: ReactNode }) {
  const isLoggedIn = (await cookies()).has('accessToken');

  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      {children}
      <AppBottomTab />
      {/* 앱에서만 동작. 로그인 상태에서 FCM 토큰을 받아 등록한다. */}
      <PushTokenRegistrar isLoggedIn={isLoggedIn} />
    </div>
  );
}
