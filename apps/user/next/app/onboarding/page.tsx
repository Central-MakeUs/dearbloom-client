import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { CustomerOnboardingForm } from './CustomerOnboardingForm';

export default async function OnboardingPage() {
  if (!(await cookies()).has('accessToken')) redirect('/');

  return <CustomerOnboardingForm />;
}
