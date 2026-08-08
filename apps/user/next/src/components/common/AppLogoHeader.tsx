import type { ReactNode } from 'react';
import { AppHeader } from '@dearbloom/ui';

/** 로고 파일은 public/images 에 있지만 next 는 basePath(/app) 아래로 서빙됩니다. */
const LOGO_SRC = '/app/images/dearbloom-logo.svg';

interface AppLogoHeaderProps {
  /** 로고 클릭 시 이동할 경로. 고객은 탐색(`/snaps`), 작가는 대시보드. */
  logoHref?: string;
  right?: ReactNode;
}

/**
 * next 앱에서 쓰는 로고형 헤더. basePath 를 붙인 로고 경로만 주입하는 얇은 래퍼입니다.
 * 하단탭으로 진입하는 최상위 화면에서만 쓰고, 하위 화면은 `Header`(뒤로가기+타이틀)를 씁니다.
 */
export function AppLogoHeader({ logoHref, right }: AppLogoHeaderProps) {
  return <AppHeader logoSrc={LOGO_SRC} logoHref={logoHref} right={right} />;
}
