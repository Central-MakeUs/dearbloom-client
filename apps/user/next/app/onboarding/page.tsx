import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';

import { CustomerOnboardingForm } from './CustomerOnboardingForm';

type OnboardingPageProps = {
  searchParams: Promise<{ forceOnboarding?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  if (!(await cookies()).has('accessToken')) redirect('/');

  const forceOnboarding = shouldForceOnboarding((await searchParams).forceOnboarding);

  return <CustomerOnboardingForm forceOnboarding={forceOnboarding} />;
}
