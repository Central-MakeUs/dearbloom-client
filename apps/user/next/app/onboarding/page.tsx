import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';
import { safeReturnUrl } from '@/src/lib/returnUrl';

import { CustomerOnboardingForm } from './CustomerOnboardingForm';

type OnboardingPageProps = {
  searchParams: Promise<{ forceOnboarding?: string; returnUrl?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  if (!(await cookies()).has('accessToken')) redirect('/');

  const { forceOnboarding: forceOnboardingParam, returnUrl: returnUrlParam } = await searchParams;
  const forceOnboarding = shouldForceOnboarding(forceOnboardingParam);

  return (
    <CustomerOnboardingForm
      forceOnboarding={forceOnboarding}
      returnUrl={safeReturnUrl(returnUrlParam)}
    />
  );
}
