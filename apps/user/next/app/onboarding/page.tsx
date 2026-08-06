import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { LOGIN_REDIRECT_PATH } from '@/src/lib/env';
import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';

import { CustomerOnboardingForm } from './CustomerOnboardingForm';

type OnboardingPageProps = {
  searchParams: Promise<{ forceOnboarding?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  // redirect() 는 basePath(`/app`)를 자동으로 붙이므로 경로에 `/app` 을 넣지 않는다.
  if (!(await cookies()).has('accessToken')) redirect(LOGIN_REDIRECT_PATH);

  const forceOnboarding = shouldForceOnboarding((await searchParams).forceOnboarding);

  return <CustomerOnboardingForm forceOnboarding={forceOnboarding} />;
}
