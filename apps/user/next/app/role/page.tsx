import { redirect } from 'next/navigation';

import type { OAuthProvider } from '@dearbloom/features-auth';

import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';
import { safeReturnUrl } from '@/src/lib/returnUrl';

import { RoleSelectionForm } from './RoleSelectionForm';

type RoleSelectionPageProps = {
  searchParams: Promise<{ forceOnboarding?: string; provider?: string; returnUrl?: string }>;
};

export default async function RoleSelectionPage({ searchParams }: RoleSelectionPageProps) {
  const {
    forceOnboarding: forceOnboardingParam,
    provider: providerParam,
    returnUrl: returnUrlParam,
  } = await searchParams;
  const forceOnboarding = shouldForceOnboarding(forceOnboardingParam);
  const provider = getOAuthProvider(providerParam);
  const returnUrl = safeReturnUrl(returnUrlParam);

  if (!provider) redirect('/app/login');

  return (
    <RoleSelectionForm forceOnboarding={forceOnboarding} provider={provider} returnUrl={returnUrl} />
  );
}

function getOAuthProvider(value?: string): OAuthProvider | undefined {
  return value === 'apple' || value === 'google' ? value : undefined;
}
