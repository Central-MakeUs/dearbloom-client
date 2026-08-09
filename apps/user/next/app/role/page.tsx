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

  // next/navigation 의 redirect 는 basePath('/app')를 자동으로 붙인다 — 경로에 /app 을 쓰면 /app/app/... 이 된다.
  if (!provider) redirect('/login');

  return (
    <RoleSelectionForm forceOnboarding={forceOnboarding} provider={provider} returnUrl={returnUrl} />
  );
}

function getOAuthProvider(value?: string): OAuthProvider | undefined {
  return value === 'apple' || value === 'google' ? value : undefined;
}
