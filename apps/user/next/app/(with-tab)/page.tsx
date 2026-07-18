import { cookies } from 'next/headers';

type RootPageProps = {
  searchParams?: Promise<{ auth?: string; provider?: string }>;
};

export default async function RootPage({ searchParams }: RootPageProps) {
  const resolvedSearchParams = await searchParams;
  const authResult = resolvedSearchParams?.auth;
  const authProvider =
    resolvedSearchParams?.provider === 'apple' || resolvedSearchParams?.provider === 'google'
      ? resolvedSearchParams.provider
      : undefined;
  const cookieStore = await cookies();
  const hasAccessToken = cookieStore.has('accessToken');
  const hasRefreshToken = cookieStore.has('refreshToken');
  const isLoggedIn = hasAccessToken && hasRefreshToken;
  const isLocalDevelopment = process.env.NODE_ENV === 'development';
  const oauthLabel =
    authProvider === 'apple'
      ? 'Apple OAuth 확인'
      : authProvider === 'google'
        ? 'Google OAuth 확인'
        : '소셜 OAuth 확인';

  const authStatus = (
    <section className="mt-6 flex flex-col gap-4 rounded-lg border border-neutral-200 bg-neutral-0 p-5 shadow-elevation">
      <div className="flex flex-col gap-1">
        <p className="text-caption-1 text-neutral-500">{oauthLabel}</p>
        <h2 className="text-head-2 text-neutral-950">{isLoggedIn ? '로그인됨' : '로그인 전'}</h2>
        <p className="text-body-5 text-neutral-600">
          {isLoggedIn
            ? '브라우저 쿠키에 accessToken과 refreshToken이 저장되어 있습니다.'
            : isLocalDevelopment
              ? 'Google 로그인은 oneTimeCode를 교환하고, Apple 로그인은 백엔드 OAuth로 이동합니다.'
              : '소셜 로그인 후 백엔드가 발급한 쿠키로 로그인 상태를 확인합니다.'}
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
          <div className="flex flex-col gap-2">
            <a
              className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-5 text-body-3 font-medium text-neutral-0"
              href="/app/api/auth/login?provider=google"
            >
              Google로 로그인
            </a>
            <a
              className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-100 px-5 text-body-3 font-medium text-neutral-950"
              href="/app/api/auth/login?provider=apple"
            >
              Apple로 로그인
            </a>
          </div>
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
