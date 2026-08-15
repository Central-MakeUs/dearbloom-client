import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Header } from '@dearbloom/ui';

import { OnboardingProgress } from '@/src/components/common/OnboardingProgress';
import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';
import { getOnboardingTermsPath } from '@/src/lib/onboardingRoute';
import { safeReturnUrl } from '@/src/lib/returnUrl';

import { ArtistOnboardingForm } from './ArtistOnboardingForm';

type ArtistOnboardingPageProps = {
  searchParams: Promise<{ error?: string; forceOnboarding?: string; returnUrl?: string }>;
};

export default async function ArtistOnboardingPage({ searchParams }: ArtistOnboardingPageProps) {
  if (!(await cookies()).has('accessToken')) redirect('/dev/login');

  const { error, forceOnboarding: forceOnboardingParam, returnUrl: returnUrlParam } =
    await searchParams;
  const forceOnboarding = shouldForceOnboarding(forceOnboardingParam);
  const returnUrl = safeReturnUrl(returnUrlParam);
  const header = (
    <div>
      <Header backHref={getOnboardingTermsPath('ARTIST', forceOnboarding, returnUrl)} />
      <OnboardingProgress step={2} total={2} />
    </div>
  );

  const content = (
    <section className="px-4 pt-2">
      <div className="px-1 py-3">
        <h1 className="text-head-1 text-neutral-900">작가 프로필을 완성해 주세요.</h1>
        <p className="mt-3 text-body-2 text-neutral-800">
          고객에게 보여질 사진과
          <br />
          주로 활동하는 지역을 입력해 주세요.
        </p>
      </div>
      <ArtistOnboardingForm
        forceOnboarding={forceOnboarding}
        hasServerError={Boolean(error)}
      />
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
