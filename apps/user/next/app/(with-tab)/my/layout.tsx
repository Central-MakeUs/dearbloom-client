import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { MyMenu } from './MyMenu';

/**
 * 마이 영역 — PC(lg 이상)에선 왼쪽 메뉴 사이드바 + 오른쪽 각 화면. 모바일은 화면 그대로.
 *
 * 각 화면의 고정 헤더(52px)가 사이드바 위를 덮으므로 사이드바는 그만큼 내려서 시작한다.
 * 로그아웃 상태엔 메뉴(로그아웃·탈퇴)가 의미 없어 사이드바를 띄우지 않는다. 쿠키가 남아 있어도
 * 만료돼 화면이 로그인 안내(LoginRequired)를 띄우면 사이드바를 숨기고 한 열로 돌린다.
 */
export default async function MyLayout({ children }: { children: ReactNode }) {
  const isLoggedIn = (await cookies()).has('accessToken');
  if (!isLoggedIn) return children;

  const sideMenu = (
    <aside
      aria-label="마이 메뉴"
      className="hidden lg:sticky lg:top-[calc(theme(spacing.gnb)+76px)] lg:mt-[76px] lg:block lg:rounded-lg lg:bg-neutral-0 lg:py-3 lg:group-has-[[data-login-required]]/my:hidden"
    >
      <MyMenu className="mt-0" />
    </aside>
  );

  return (
    <div className="group/my lg:mx-auto lg:grid lg:max-w-screen-lg lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:px-10 lg:has-[[data-login-required]]:block">
      {sideMenu}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
