'use client';

import Image from 'next/image';
import { useEffect, useState, type MouseEvent } from 'react';
import { cn } from '@dearbloom/ui';

import appleSignInLogo from '../../public/images/apple-sign-in.svg';
import googleSignInLogo from '../../public/images/google-sign-in.svg';

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

const googleLogo = (
  <Image
    alt=""
    aria-hidden
    className="size-5 shrink-0"
    height={20}
    src={googleSignInLogo}
    unoptimized
    width={20}
  />
);

const appleLogo = (
  <span className="relative h-6 w-5 shrink-0 overflow-hidden">
    <Image
      alt=""
      aria-hidden
      className="absolute left-0 top-0 h-[22.8px] w-[18.75px]"
      height={22.8}
      src={appleSignInLogo}
      unoptimized
      width={18.75}
    />
  </span>
);

/**
 * 로그인 시작은 push 가 아니라 replace 로 나간다.
 *
 * 로그인 화면이 히스토리에 남으면, 로그인을 마치고 뒤로가기를 눌렀을 때 로그인 화면이 나오고
 * → 이미 로그인 상태라 서버가 다시 복귀 경로로 밀어내면서 뒤로가기가 먹지 않는 트랩이 된다.
 * OAuth 리다이렉트 체인이 로그인 엔트리를 그대로 덮어쓰게 해서 그 엔트리를 없앤다.
 */
function startLogin(event: MouseEvent<HTMLAnchorElement>) {
  const { href } = event.currentTarget;
  event.preventDefault();
  window.location.replace(href);
}

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
      onClick={startLogin}
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
        onClick={startLogin}
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
