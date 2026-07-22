'use client';

import { useEffect, useState } from 'react';

const fallbackApiBaseUrl = 'https://dev-api.dearbloom.co.kr';
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? fallbackApiBaseUrl).replace(/\/$/, '');
const NATIVE_GOOGLE_LOGIN = 'NATIVE_GOOGLE_LOGIN';
const NATIVE_APPLE_LOGIN = 'NATIVE_APPLE_LOGIN';
const NATIVE_SOCIAL_LOGIN_RESULT = 'NATIVE_SOCIAL_LOGIN_RESULT';

type NativeAppPlatform = 'android' | 'ios';
type NativeSocialProvider = 'APPLE' | 'GOOGLE';
type NativeLoginResult = {
  errorCode?: string;
  message?: string;
  provider: NativeSocialProvider;
  socialToken?: string;
  status: 'cancelled' | 'error' | 'success';
  type: typeof NATIVE_SOCIAL_LOGIN_RESULT;
};

declare global {
  interface Window {
    __DEARBLOOM_NATIVE_APP__?: {
      platform?: string;
    };
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

function getNativeAppPlatform(): NativeAppPlatform | null {
  const platform = window.__DEARBLOOM_NATIVE_APP__?.platform;

  return platform === 'android' || platform === 'ios' ? platform : null;
}

export function SocialLoginButtons() {
  const [nativePlatform, setNativePlatform] = useState<NativeAppPlatform | null>();
  const [loginError, setLoginError] = useState<string>();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    setNativePlatform(getNativeAppPlatform());
  }, []);

  useEffect(() => {
    const handleNativeLoginResult = async (event: Event) => {
      const result = (event as CustomEvent<NativeLoginResult>).detail;

      if (!result || result.type !== NATIVE_SOCIAL_LOGIN_RESULT) {
        return;
      }

      if (result.status === 'cancelled') {
        setIsLoggingIn(false);
        return;
      }

      if (result.status !== 'success' || !result.socialToken) {
        setLoginError(result.message ?? '소셜 로그인에 실패했습니다.');
        setIsLoggingIn(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
          body: JSON.stringify({
            socialProvider: result.provider,
            socialToken: result.socialToken,
          }),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error(`로그인 서버가 HTTP ${response.status}로 응답했습니다.`);
        }

        window.location.replace('/app');
      } catch (error) {
        setLoginError(error instanceof Error ? error.message : '로그인 서버 요청에 실패했습니다.');
        setIsLoggingIn(false);
      }
    };

    window.addEventListener(NATIVE_SOCIAL_LOGIN_RESULT, handleNativeLoginResult);

    return () => {
      window.removeEventListener(NATIVE_SOCIAL_LOGIN_RESULT, handleNativeLoginResult);
    };
  }, []);

  const requestNativeLogin = (provider: NativeSocialProvider) => {
    const bridge = window.ReactNativeWebView;

    if (!bridge) {
      setLoginError('앱 로그인 브리지를 찾지 못했습니다.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(undefined);
    bridge.postMessage(
      JSON.stringify({
        type: provider === 'GOOGLE' ? NATIVE_GOOGLE_LOGIN : NATIVE_APPLE_LOGIN,
      }),
    );
  };

  if (nativePlatform === undefined) {
    return null;
  }

  const googleButton = nativePlatform ? (
    <button
      className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-5 text-body-4 font-medium text-neutral-0 disabled:opacity-40"
      disabled={isLoggingIn}
      onClick={() => requestNativeLogin('GOOGLE')}
      type="button"
    >
      Google로 로그인
    </button>
  ) : (
    <a
      className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-5 text-body-4 font-medium text-neutral-0"
      href="/app/api/auth/login?provider=google"
    >
      Google로 로그인
    </a>
  );

  const appleButton =
    nativePlatform === 'android' ? null : nativePlatform === 'ios' ? (
      <button
        className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-100 px-5 text-body-4 font-medium text-neutral-950 disabled:opacity-40"
        disabled={isLoggingIn}
        onClick={() => requestNativeLogin('APPLE')}
        type="button"
      >
        Apple로 로그인
      </button>
    ) : (
      <a
        className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-100 px-5 text-body-4 font-medium text-neutral-950"
        href="/app/api/auth/login?provider=apple"
      >
        Apple로 로그인
      </a>
    );

  return (
    <div className="flex flex-col gap-2">
      {googleButton}
      {appleButton}
      {loginError && <p className="text-caption-1 text-danger">{loginError}</p>}
    </div>
  );
}
