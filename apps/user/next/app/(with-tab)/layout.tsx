import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppBottomTab } from '@/src/components/common/AppBottomTab';

export default async function WithTabLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  if (cookieStore.has('accessToken') && cookieStore.get('activeRole')?.value === 'ARTIST') {
    redirect('/artist/dashboard');
  }

  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      {children}
      <AppBottomTab />
    </div>
  );
}
