import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { OAuthProvider } from '@dearbloom/features-auth';

import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';

import { RoleSelectionForm } from './RoleSelectionForm';

type RoleSelectionPageProps = {
  searchParams: Promise<{ forceOnboarding?: string; provider?: string }>;
};

export default async function RoleSelectionPage({ searchParams }: RoleSelectionPageProps) {
  const { forceOnboarding: forceOnboardingParam, provider: providerParam } = await searchParams;
  const forceOnboarding = shouldForceOnboarding(forceOnboardingParam);
  const provider = getOAuthProvider(providerParam);

  if (!provider && !(await cookies()).has('accessToken')) redirect('/app/login');

  return <RoleSelectionForm forceOnboarding={forceOnboarding} provider={provider} />;
}

function getOAuthProvider(value?: string): OAuthProvider | undefined {
  return value === 'apple' || value === 'google' ? value : undefined;
}
