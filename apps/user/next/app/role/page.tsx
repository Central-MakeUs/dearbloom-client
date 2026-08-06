import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { OAuthProvider } from '@dearbloom/features-auth';

import { LOGIN_REDIRECT_PATH } from '@/src/lib/env';
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

  // redirect() 는 basePath(`/app`)를 자동으로 붙이므로 경로에 `/app` 을 넣지 않는다.
  if (!provider && !(await cookies()).has('accessToken')) redirect(LOGIN_REDIRECT_PATH);

  return (
    <RoleSelectionForm
      forceOnboarding={forceOnboarding}
      provider={provider}
      returnUrl={returnUrl}
    />
  );
}

function getOAuthProvider(value?: string): OAuthProvider | undefined {
  return value === 'apple' || value === 'google' ? value : undefined;
}
