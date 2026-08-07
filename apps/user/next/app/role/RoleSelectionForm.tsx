'use client';

import { useEffect, useState, type ReactNode } from 'react';

import type { AuthRole, OAuthProvider } from '@dearbloom/features-auth';
import type { MemberRole } from '@dearbloom/shared';
import { BottomButton, Card, cn, Header } from '@dearbloom/ui';

import { getOnboardingFormPath } from '@/src/lib/onboardingRoute';

const fallbackApiBaseUrl = 'https://dev-api.dearbloom.co.kr';
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? fallbackApiBaseUrl).replace(/\/$/, '');
const NATIVE_GOOGLE_LOGIN = 'NATIVE_GOOGLE_LOGIN';
const NATIVE_APPLE_LOGIN = 'NATIVE_APPLE_LOGIN';
const NATIVE_SOCIAL_LOGIN_RESULT = 'NATIVE_SOCIAL_LOGIN_RESULT';

type NativeSocialProvider = 'APPLE' | 'GOOGLE';
type NativeLoginResult = {
  authorizationCode?: string;
  message?: string;
  provider: NativeSocialProvider;
  socialToken?: string;
  status: 'cancelled' | 'error' | 'success';
  type: typeof NATIVE_SOCIAL_LOGIN_RESULT;
};

type NativeLoginResponse = {
  data?: {
    needsOnboarding: boolean;
    selectedRole: AuthRole;
  };
  error?: { message?: string };
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

export function RoleSelectionForm({
  forceOnboarding,
  provider,
  returnUrl,
}: {
  forceOnboarding: boolean;
  provider: OAuthProvider;
  returnUrl?: string;
}) {
  const [role, setRole] = useState<MemberRole>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const handleNativeLoginResult = async (event: Event) => {
      const result = (event as CustomEvent<NativeLoginResult>).detail;
      const expectedProvider = provider.toUpperCase();

      if (
        !result ||
        result.type !== NATIVE_SOCIAL_LOGIN_RESULT ||
        result.provider !== expectedProvider
      ) {
        return;
      }

      if (result.status === 'cancelled') {
        setIsSubmitting(false);
        return;
      }

      if (result.status !== 'success' || !result.socialToken || !role) {
        setError(result.message ?? '소셜 로그인에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
          body: JSON.stringify({
            authorizationCode: result.authorizationCode,
            role,
            socialProvider: result.provider,
            socialToken: result.socialToken,
          }),
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
        const body = (await response.json()) as NativeLoginResponse;

        if (!response.ok || !body.data) {
          throw new Error(
            body.error?.message ?? `로그인 서버가 HTTP ${response.status}로 응답했습니다.`,
          );
        }

        window.location.replace(
          getLoginDestination(
            body.data.selectedRole,
            forceOnboarding || body.data.needsOnboarding,
            forceOnboarding,
          ),
        );
      } catch (loginError) {
        setError(
          loginError instanceof Error ? loginError.message : '로그인 서버 요청에 실패했습니다.',
        );
        setIsSubmitting(false);
      }
    };

    window.addEventListener(NATIVE_SOCIAL_LOGIN_RESULT, handleNativeLoginResult);

    return () => window.removeEventListener(NATIVE_SOCIAL_LOGIN_RESULT, handleNativeLoginResult);
  }, [forceOnboarding, provider, role]);

  const submit = async () => {
    if (!role || isSubmitting) return;

    setIsSubmitting(true);
    setError(undefined);

    if (window.__DEARBLOOM_NATIVE_APP__?.platform) {
      const bridge = window.ReactNativeWebView;

      if (!bridge) {
        setError('앱 로그인 브리지를 찾지 못했습니다.');
        setIsSubmitting(false);
        return;
      }

      bridge.postMessage(
        JSON.stringify({
          type: provider === 'google' ? NATIVE_GOOGLE_LOGIN : NATIVE_APPLE_LOGIN,
        }),
      );
      return;
    }

    const forceOnboardingQuery = forceOnboarding ? '&forceOnboarding=1' : '';
    const returnUrlQuery = returnUrl ? `&returnUrl=${encodeURIComponent(returnUrl)}` : '';
    window.location.assign(
      `/app/api/auth/login?provider=${provider}&role=${role}${forceOnboardingQuery}${returnUrlQuery}`,
    );
  };

  const roleCard = (value: MemberRole, title: string, description: ReactNode) => (
    <button
      aria-pressed={role === value}
      className="w-full text-left"
      onClick={() => setRole(value)}
      type="button"
    >
      <Card
        className={cn(
          'relative h-[145px] w-full overflow-hidden border-0 bg-primary-100 px-7 py-6 shadow-elevation',
          role === value && 'ring-2 ring-primary',
        )}
      >
        <span className="block text-head-2 text-neutral-950">{title}</span>
        <span className="mt-2 block w-[175px] text-body-2 text-neutral-950">{description}</span>
      </Card>
    </button>
  );

  const roles = (
    <div className="flex flex-col gap-4">
      {roleCard(
        'CUSTOMER',
        '모델 사용자에요',
        <>
          마음에 드는 작가를 찾아
          <br />
          촬영을 예약할 수 있어요.
        </>,
      )}
      {roleCard(
        'ARTIST',
        '작가 사용자에요',
        <>
          내 작품을 등록하고
          <br />
          촬영 문의를 받을 수 있어요.
        </>,
      )}
    </div>
  );

  const footer = (
    <div className="absolute inset-x-0 bottom-0 bg-neutral-100 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      {error ? (
        <p className="mb-2 text-center text-caption-1 text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <BottomButton color="black" disabled={!role || isSubmitting} onClick={submit}>
        {isSubmitting ? '확인 중...' : '다음'}
      </BottomButton>
    </div>
  );

  return (
    <main className="min-h-dvh bg-neutral-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden pb-20">
        <Header onBack={() => window.history.back()} />
        <section className="px-4 pt-2">
          <h1 className="px-1 py-3 text-head-1 text-neutral-950">
            디어블룸 이용 방식을 선택해 주세요.
          </h1>
          <div className="mt-2">{roles}</div>
        </section>
        {footer}
      </div>
    </main>
  );
}

function getLoginDestination(role: AuthRole, needsOnboarding: boolean, forceOnboarding = false) {
  if (needsOnboarding) {
    return getOnboardingFormPath(role, forceOnboarding);
  }

  return role === 'CUSTOMER' ? '/snaps' : '/app/artist/dashboard';
}
