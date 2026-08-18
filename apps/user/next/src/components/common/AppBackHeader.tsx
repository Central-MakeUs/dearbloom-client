'use client';

import type { ComponentProps } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@dearbloom/ui';
import { navigateAppBack } from '@/src/lib/appNavigation';

type Props = Omit<ComponentProps<typeof Header>, 'backHref' | 'onBack'> & {
  fallbackHref: string;
};

export function AppBackHeader({ fallbackHref, ...props }: Props) {
  const router = useRouter();
  const onBack = () => navigateAppBack(router, fallbackHref);

  return <Header {...props} onBack={onBack} />;
}
