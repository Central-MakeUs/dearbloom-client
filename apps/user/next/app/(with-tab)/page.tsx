import { cookies } from 'next/headers';

import {
  createLocalOAuthAuthorizationUrl,
  createOAuthAuthorizationUrl,
} from '@dearbloom/features-auth';

type RootPageProps = {
  searchParams?: Promise<{ auth?: string }>;
};

export default async function RootPage({ searchParams }: RootPageProps) {
  const authResult = (await searchParams)?.auth;
  const cookieStore = await cookies();
  const hasAccessToken = cookieStore.has('accessToken');
  const hasRefreshToken = cookieStore.has('refreshToken');
  const isLoggedIn = hasAccessToken && hasRefreshToken;
  const isLocalDevelopment = process.env.NODE_ENV === 'development';
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_OAUTH_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'https://dev-api.dearbloom.co.kr';
  const localGoogleCallbackUrl =
    process.env.NEXT_PUBLIC_LOCAL_GOOGLE_CALLBACK_URL ??
    'http://localhost:3000/app/api/auth/callback';
  const googleLoginHref =
    isLocalDevelopment
      ? createLocalOAuthAuthorizationUrl({
          baseUrl: apiBaseUrl,
          targetUrl: localGoogleCallbackUrl,
        })
      : createOAuthAuthorizationUrl({
          baseUrl: apiBaseUrl,
          provider: 'google',
        });

  const authStatus = (
    <section className="mt-6 flex flex-col gap-4 rounded-lg border border-neutral-200 bg-neutral-0 p-5 shadow-elevation">
      <div className="flex flex-col gap-1">
        <p className="text-caption-1 text-neutral-500">Google OAuth 확인</p>
        <h2 className="text-head-2 text-neutral-950">{isLoggedIn ? '로그인됨' : '로그인 전'}</h2>
        <p className="text-body-5 text-neutral-600">
          {isLoggedIn
            ? '브라우저 쿠키에 accessToken과 refreshToken이 저장되어 있습니다.'
            : isLocalDevelopment
              ? 'Google 로그인 후 oneTimeCode를 교환해 localhost 쿠키를 심습니다.'
              : 'Google 로그인 후 백엔드가 발급한 쿠키로 로그인 상태를 확인합니다.'}
        </p>
        {authResult && <p className="text-caption-1 text-danger">최근 콜백 결과: {authResult}</p>}
      </div>
      <div className="flex flex-col gap-3">
        {isLoggedIn ? (
          <a
            className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-100 px-5 text-body-3 font-medium text-neutral-950"
            href="/app/api/auth/logout"
          >
            로그아웃하고 다시 테스트
          </a>
        ) : (
          <a
            className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-5 text-body-3 font-medium text-neutral-0"
            href={googleLoginHref}
          >
            Google로 로그인
          </a>
        )}
        <span className="text-caption-1 text-neutral-500">
          accessToken: {hasAccessToken ? '있음' : '없음'} · refreshToken:{' '}
          {hasRefreshToken ? '있음' : '없음'}
        </span>
      </div>
    </section>
  );

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="text-head-1 text-neutral-950">user-next 루트</h1>
      <p className="mt-1 text-caption-1 text-neutral-600">route: /</p>
      {authStatus}
    </main>
  );
}
