import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { MemberRole } from '@dearbloom/shared';

import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';

import { TermsAgreementForm } from './TermsAgreementForm';

type TermsPageProps = {
  searchParams: Promise<{ forceOnboarding?: string; role?: string }>;
};

export default async function TermsPage({ searchParams }: TermsPageProps) {
  if (!(await cookies()).has('accessToken')) redirect('/app/login');

  const { forceOnboarding: forceOnboardingParam, role: roleParam } = await searchParams;
  const role = getRole(roleParam);
  if (!role) redirect('/app/role');

  return (
    <TermsAgreementForm forceOnboarding={shouldForceOnboarding(forceOnboardingParam)} role={role} />
  );
}

function getRole(value?: string): MemberRole | undefined {
  return value === 'CUSTOMER' || value === 'ARTIST' ? value : undefined;
}
