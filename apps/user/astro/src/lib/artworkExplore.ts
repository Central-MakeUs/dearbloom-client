import type { AstroGlobal } from 'astro';
import {
  getArtworkPage,
  fetchPublicWithAuthFallback,
  ARTWORK_PAGE_SIZE,
  type ArtworkListParams,
  type ArtworkPage,
} from '@dearbloom/shared';
import type { ArtworkView } from '@/lib/artworkFilter';

/**
 * 작품 탐색 화면(/snaps·/region/*·/) 공통 — 캐시 헤더를 정하고 첫 페이지를 SSR 로 받아옵니다.
 * 헤더는 렌더가 시작되기 전에 정해야 해서 컴포넌트가 아니라 페이지 frontmatter 에서 부릅니다.
 */
export async function loadFirstArtworkPage(
  Astro: AstroGlobal,
  filter: ArtworkListParams,
): Promise<{ page: ArtworkPage; loadFailed: boolean }> {
  const token = Astro.cookies.has('onboardingPending')
    ? undefined
    : Astro.cookies.get('accessToken')?.value;
  if (token) {
    // 로그인 시 저장상태(isSaved)를 반영 → per-user 렌더(공유 캐시 금지).
    Astro.response.headers.set('Cache-Control', 'private, no-store');
  } else {
    // 익명 렌더에는 개인 상태가 없다(isSaved 는 null) → CDN 에 짧게 올려 SEO·재방문 트래픽을 함수 없이 받는다.
    // Vary: Cookie 로 accessToken 을 든 요청이 이 익명 응답을 받지 않게 한다.
    Astro.response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    Astro.response.headers.set('Vary', 'Cookie');
  }

  // 첫 페이지만 SSR 로 그린다(SEO·첫 렌더). 이어지는 페이지는 ArtworkFeed 가 nextCursor 로 받아온다.
  try {
    // 만료 토큰(401)이면 익명으로 재시도 → public 목록은 항상 노출(만료 쿠키 하나로 에러 방지).
    const { data, tokenExpired } = await fetchPublicWithAuthFallback(
      (o) => getArtworkPage({ ...filter, size: ARTWORK_PAGE_SIZE.DEFAULT }, o),
      token,
    );
    if (tokenExpired) Astro.cookies.delete('accessToken', { path: '/' });
    return { page: data, loadFailed: false };
  } catch (e) {
    // SSR 실패 원인은 서버 로그(Vercel Runtime Logs)에서 확인.
    console.error(`[${Astro.url.pathname}] getArtworkPage 실패`, e);
    return { page: { artworkList: [], totalCount: 0, nextCursor: null, hasNext: false }, loadFailed: true };
  }
}

/*
  아일랜드 props 는 HTML 에 JSON 으로 직렬화된다. 그리드뷰는 카드 썸네일 한 장만 쓰는데
  작품당 사진 URL 여러 개인 photoList(리스트뷰 전용)까지 실려서, 한 화면에 원본 CDN URL 이
  89개나 박혀 있었다. 리스트뷰에서만 넘긴다.
*/
export function toIslandPage(page: ArtworkPage, view: ArtworkView): ArtworkPage {
  if (view === 'list') return page;
  return {
    ...page,
    artworkList: page.artworkList.map((artwork) => {
      const trimmed = { ...artwork };
      delete trimmed.photoList;
      return trimmed;
    }),
  };
}
