import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';

import { CustomerOnboardingForm } from './CustomerOnboardingForm';

type OnboardingPageProps = {
  searchParams: Promise<{ completed?: string; forceOnboarding?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  if (!(await cookies()).has('accessToken')) redirect('/');

  const params = await searchParams;
  const forceOnboarding = shouldForceOnboarding(params.forceOnboarding);

  return (
    <CustomerOnboardingForm
      forceOnboarding={forceOnboarding}
      initialComplete={params.completed === '1'}
    />
  );
}
