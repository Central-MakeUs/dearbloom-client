'use client';

import { usePathname } from 'next/navigation';
import { MainTopNav, TopNav } from '@dearbloom/ui';
import { ARTIST_TABS } from './AppArtistBottomTab';
import { AppLink } from './AppLink';

/**
 * 가입·로그인·초대·문의 작성 흐름은 메뉴로 빠져나가면 안 되는 화면이라 GNB 를 띄우지 않습니다.
 * 이 화면들은 PC 에서 가운데 카드(pcFrame)로 그려지고, 카드 높이도 GNB 가 없다고 보고 잡혀 있습니다.
 */
const HIDDEN_PREFIXES = ['/login', '/onboarding', '/role', '/dev', '/invite', '/inquiries'];

const LOGO_SRC = '/app/images/dearbloom-logo.svg';

/**
 * PC(lg 이상) 상단 GNB. 작가 화면이면 작가 탭, 그 외엔 고객 탭을 띄웁니다.
 * usePathname() 은 basePath('/app') 를 제외한 경로를 돌려줍니다 — 고객 탭은 실제 URL 기준으로
 * active 를 판단하므로 '/app' 을 붙이고, 작가 탭은 basePath 없는 경로 그대로 판단합니다.
 */
export function AppTopNav() {
  const pathname = usePathname() ?? '/';
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  if (pathname.startsWith('/artist')) {
    return (
      <TopNav
        tabs={ARTIST_TABS}
        currentPath={pathname}
        label="작가 네비게이션"
        logoSrc={LOGO_SRC}
        logoHref="/app/artist/dashboard"
        badge="작가"
        linkComponent={AppLink}
      />
    );
  }

  return <MainTopNav currentPath={`/app${pathname}`} logoSrc={LOGO_SRC} linkComponent={AppLink} />;
}
