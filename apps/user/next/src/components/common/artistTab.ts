/**
 * 작가 화면 하단탭 표시 규칙 — **단일 진실 공급원**.
 *
 * 하단탭(`AppArtistBottomTab`)과 레이아웃 크롬(`ArtistShell` 의 스크롤 페이드·하단 여백)이
 * 같은 판정을 써야 합니다. 예전엔 탭만 스스로 숨고 레이아웃은 탭이 있다고 가정해서,
 * 탭이 없는 화면에 페이드가 바닥에서 60px 떠 있고 여백 80px 이 남았습니다.
 *
 * 숨길 경로를 추가할 땐 이 함수만 고치면 페이드·여백이 함께 따라옵니다.
 *
 * `usePathname()` 은 basePath('/app') 를 제외한 경로('/artist/...')를 반환합니다.
 */
export function isArtistTabHidden(pathname: string): boolean {
  if (pathname.includes('/artist/products/new')) return true;
  if (pathname.includes('/artist/products/') && pathname.endsWith('/edit')) return true;
  if (pathname.startsWith('/artist/profile')) return true;
  if (/^\/artist\/chats\/.+/.test(pathname)) return true;
  return false;
}
