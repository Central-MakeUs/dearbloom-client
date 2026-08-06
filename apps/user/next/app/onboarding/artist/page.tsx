import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { LOGIN_REDIRECT_PATH } from '@/src/lib/env';
import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';

import { ArtistOnboardingForm } from './ArtistOnboardingForm';

type ArtistOnboardingPageProps = {
  searchParams: Promise<{ forceOnboarding?: string }>;
};

export default async function ArtistOnboardingPage({ searchParams }: ArtistOnboardingPageProps) {
  // redirect() 는 basePath(`/app`)를 자동으로 붙이므로 경로에 `/app` 을 넣지 않는다.
  if (!(await cookies()).has('accessToken')) redirect(LOGIN_REDIRECT_PATH);

  const forceOnboarding = shouldForceOnboarding((await searchParams).forceOnboarding);
  const header = (
    <header className="flex h-[52px] items-center px-2">
      <a
        aria-label="뒤로가기"
        className="flex h-11 w-11 items-center justify-center text-neutral-950"
        href="/app/role"
      >
        <svg
          aria-hidden
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </a>
    </header>
  );

  const content = (
    <section className="px-4 pt-2">
      <div className="px-1 py-3">
        <h1 className="text-head-1 text-neutral-900">작가 프로필을 완성해 주세요.</h1>
        <p className="mt-3 text-body-2 text-neutral-800">
          고객에게 보여질 사진과 이름,
          <br />
          주로 활동하는 지역을 입력해 주세요.
        </p>
      </div>
      <ArtistOnboardingForm forceOnboarding={forceOnboarding} />
    </section>
  );

  return (
    <main className="min-h-dvh bg-neutral-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden pb-24">
        {header}
        {content}
      </div>
    </main>
  );
}
