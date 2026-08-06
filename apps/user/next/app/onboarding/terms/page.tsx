import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { MemberRole } from '@dearbloom/shared';

import { LOGIN_REDIRECT_PATH } from '@/src/lib/env';
import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';

import { TermsAgreementForm } from './TermsAgreementForm';

type TermsPageProps = {
  searchParams: Promise<{ forceOnboarding?: string; role?: string }>;
};

export default async function TermsPage({ searchParams }: TermsPageProps) {
  // redirect() 는 basePath(`/app`)를 자동으로 붙이므로 경로에 `/app` 을 넣지 않는다.
  if (!(await cookies()).has('accessToken')) redirect(LOGIN_REDIRECT_PATH);

  const { forceOnboarding: forceOnboardingParam, role: roleParam } = await searchParams;
  const role = getRole(roleParam);
  if (!role) redirect('/role');

  return (
    <TermsAgreementForm forceOnboarding={shouldForceOnboarding(forceOnboardingParam)} role={role} />
  );
}

function getRole(value?: string): MemberRole | undefined {
  return value === 'CUSTOMER' || value === 'ARTIST' ? value : undefined;
}
