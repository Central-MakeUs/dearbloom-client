'use client';

import { useEffect, useState } from 'react';
import { Apple } from 'lucide-react';
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
  'inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-md px-[14px] text-body-5 disabled:pointer-events-none disabled:opacity-40';

const googleIcon = (
  <svg aria-hidden fill="currentColor" height="20" viewBox="0 0 24 24" width="20">
    <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z" />
    <path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
    <path d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.2L6.5 14Z" />
    <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 5.9Z" />
  </svg>
);

export function SocialLoginButtons({
  forceOnboarding,
  returnUrl,
}: {
  forceOnboarding: boolean;
  returnUrl?: string;
}) {
  const [nativePlatform, setNativePlatform] = useState<NativeAppPlatform | null>(null);
  const forceOnboardingQuery = forceOnboarding ? '&forceOnboarding=1' : '';
  const returnUrlQuery = returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : '';

  useEffect(() => {
    setNativePlatform(getNativeAppPlatform());
  }, []);

  const googleButton = (
    <a
      className={cn(socialButtonClassName, 'bg-neutral-0 text-neutral-950')}
      href={`/app/role?provider=google${forceOnboardingQuery}${returnUrlQuery}`}
    >
      {googleIcon}
      <span>Google로 시작하기</span>
    </a>
  );

  const appleButton =
    nativePlatform === 'android' ? null : (
      <a
        className={cn(socialButtonClassName, 'bg-neutral-950 text-neutral-0')}
        href={`/app/role?provider=apple${forceOnboardingQuery}${returnUrlQuery}`}
      >
        <Apple aria-hidden fill="currentColor" size={20} strokeWidth={0} />
        <span>Apple로 시작하기</span>
      </a>
    );

  return (
    <div className="flex flex-col gap-3">
      {googleButton}
      {appleButton}
    </div>
  );
}
