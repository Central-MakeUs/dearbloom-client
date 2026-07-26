'use client';

import { useEffect, useState } from 'react';
import { cn } from '@dearbloom/ui';

type NativeAppPlatform = 'android' | 'ios';

declare global {
  interface Window {
    __DEARBLOOM_NATIVE_APP__?: {
      platform?: string;
    };
  }
}

function getNativeAppPlatform(): NativeAppPlatform | null {
  const platform = window.__DEARBLOOM_NATIVE_APP__?.platform;

  return platform === 'android' || platform === 'ios' ? platform : null;
}

const socialButtonClassName =
  'inline-flex h-[52px] w-full items-center justify-center rounded-md px-[14px] text-body-5 disabled:pointer-events-none disabled:opacity-40';

export function SocialLoginButtons() {
  const [nativePlatform, setNativePlatform] = useState<NativeAppPlatform | null>(null);

  useEffect(() => {
    setNativePlatform(getNativeAppPlatform());
  }, []);

  const googleButton = (
    <a
      className={cn(socialButtonClassName, 'bg-neutral-0 text-neutral-950')}
      href="/app/role?provider=google"
    >
      Google로 시작하기
    </a>
  );

  const appleButton = nativePlatform === 'android' ? null : (
    <a
      className={cn(socialButtonClassName, 'bg-neutral-950 text-neutral-0')}
      href="/app/role?provider=apple"
    >
      Apple로 시작하기
    </a>
  );

  return (
    <div className="flex flex-col gap-3">
      {googleButton}
      {appleButton}
    </div>
  );
}
