import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { RoleSelectionForm } from './RoleSelectionForm';

export default async function RoleSelectionPage() {
  if (!(await cookies()).has('accessToken')) redirect('/dev/login');

  return <RoleSelectionForm />;
}
