import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { OAuthProvider } from '@dearbloom/features-auth';

import { RoleSelectionForm } from './RoleSelectionForm';

type RoleSelectionPageProps = {
  searchParams: Promise<{ provider?: string }>;
};

export default async function RoleSelectionPage({ searchParams }: RoleSelectionPageProps) {
  const provider = getOAuthProvider((await searchParams).provider);

  if (!provider && !(await cookies()).has('accessToken')) redirect('/app/login');

  return <RoleSelectionForm provider={provider} />;
}

function getOAuthProvider(value?: string): OAuthProvider | undefined {
  return value === 'apple' || value === 'google' ? value : undefined;
}
