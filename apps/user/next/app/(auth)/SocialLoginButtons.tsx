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
  'inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-md px-[14px] text-body-5 disabled:pointer-events-none disabled:opacity-40';

/* eslint-disable no-restricted-syntax -- Google 공식 브랜드 로고 색상 */
const googleLogo = (
  <svg aria-hidden className="size-5 shrink-0" viewBox="0 0 18 18">
    <path
      d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.874 2.684-6.613Z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.468-.806 5.956-2.182l-2.909-2.258c-.806.54-1.836.859-3.047.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.333A9 9 0 0 0 9 18Z"
      fill="#34A853"
    />
    <path
      d="M3.963 10.705A5.42 5.42 0 0 1 3.682 9c0-.592.102-1.167.281-1.705V4.962H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.038l3.007-2.333Z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.507.454 3.441 1.345l2.582-2.582C13.463.891 11.425 0 9 0A9 9 0 0 0 .956 4.962l3.007 2.333C4.672 5.166 6.656 3.58 9 3.58Z"
      fill="#EA4335"
    />
  </svg>
);
/* eslint-enable no-restricted-syntax */

const appleLogo = (
  <svg aria-hidden className="size-5 shrink-0 fill-current" viewBox="0 0 24 24">
    <path d="M24 17.53a4.834 4.834 0 0 1-.596 1.08 11.634 11.634 0 0 1-1.128 1.697c-.595.712-1.083 1.205-1.455 1.48-.576.424-1.193.641-1.852.653-.473 0-1.043-.135-1.707-.406-.666-.27-1.277-.405-1.833-.405-.584 0-1.212.135-1.872.405-.661.271-1.205.414-1.634.428-.632.027-1.263-.197-1.894-.675-.403-.35-.912-.86-1.527-1.53-.659-.715-1.2-1.544-1.625-2.485-.455-1.016-.683-2-.683-2.953 0-1.092.236-2.034.712-2.823a4.15 4.15 0 0 1 1.508-1.5 4.06 4.06 0 0 1 2.041-.566c.502 0 1.16.156 1.977.462.815.307 1.338.463 1.57.463.174 0 .755-.183 1.744-.546.935-.337 1.724-.477 2.37-.422 1.746.141 3.057.829 3.93 2.066-1.561.946-2.333 2.271-2.318 3.971.014 1.325.495 2.429 1.44 3.309.428.407.906.722 1.434.948-.114.33-.235.648-.36.955ZM18.207.48c0 1.039-.38 2.009-1.138 2.906-.915 1.068-2.021 1.686-3.22 1.589a3.234 3.234 0 0 1-.024-.394c0-.998.435-2.066 1.207-2.94.386-.443.875-.81 1.466-1.102.59-.288 1.148-.447 1.67-.474.015.139.022.278.022.415h.017Z" />
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
      {googleLogo}
      <span>Google로 시작하기</span>
    </a>
  );

  const appleButton =
    nativePlatform === 'android' ? null : (
      <a
        className={cn(socialButtonClassName, 'bg-neutral-950 text-neutral-0')}
        href={`/app/role?provider=apple${forceOnboardingQuery}${returnUrlQuery}`}
      >
        {appleLogo}
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
