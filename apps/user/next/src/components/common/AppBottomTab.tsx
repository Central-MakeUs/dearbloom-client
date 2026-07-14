'use client';

import { usePathname } from 'next/navigation';
import { BottomTab } from '@dearbloom/ui';

/**
 * Next 앱은 basePath '/app' 이 걸려있어서 usePathname() 은 '/app' 을 제외한 경로를 돌려줍니다.
 * BottomTab 은 실제 브라우저 URL 기준으로 active 를 판단하므로 '/app' 을 붙여서 전달합니다.
 */
export function AppBottomTab() {
  const pathname = usePathname() ?? '/';
  return <BottomTab currentPath={`/app${pathname}`} />;
}
