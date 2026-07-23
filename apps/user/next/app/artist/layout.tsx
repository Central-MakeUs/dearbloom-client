import type { ReactNode } from 'react';
import { AppArtistBottomTab } from '@/src/components/common/AppArtistBottomTab';

export default function ArtistLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      {children}
      <AppArtistBottomTab />
    </div>
  );
}
