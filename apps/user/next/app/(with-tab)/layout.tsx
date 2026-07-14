import type { ReactNode } from 'react';
import { AppBottomTab } from '@/src/components/common/AppBottomTab';

export default function WithTabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      {children}
      <AppBottomTab />
    </div>
  );
}
