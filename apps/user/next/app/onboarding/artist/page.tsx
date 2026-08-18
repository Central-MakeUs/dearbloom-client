import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';

import { ArtistOnboardingForm } from './ArtistOnboardingForm';

type ArtistOnboardingPageProps = {
  searchParams: Promise<{ error?: string; forceOnboarding?: string }>;
};

export default async function ArtistOnboardingPage({ searchParams }: ArtistOnboardingPageProps) {
  if (!(await cookies()).has('accessToken')) redirect('/dev/login');

  const { error, forceOnboarding: forceOnboardingParam } = await searchParams;
  const forceOnboarding = shouldForceOnboarding(forceOnboardingParam);

  return (
    <ArtistOnboardingForm
      forceOnboarding={forceOnboarding}
      hasServerError={Boolean(error)}
    />
  );
}
