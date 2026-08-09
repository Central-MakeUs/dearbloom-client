import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { MemberRole } from '@dearbloom/shared';

import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';

import { TermsAgreementForm } from './TermsAgreementForm';

type TermsPageProps = {
  searchParams: Promise<{ forceOnboarding?: string; role?: string }>;
};

export default async function TermsPage({ searchParams }: TermsPageProps) {
  // next/navigation 의 redirect 는 basePath('/app')를 자동으로 붙인다 — 경로에 /app 을 쓰면 /app/app/... 이 된다.
  if (!(await cookies()).has('accessToken')) redirect('/login');

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
