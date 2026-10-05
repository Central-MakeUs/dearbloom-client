export const prerender = false; // 작품 목록을 요청 시 API 로 가져옴

import type { APIRoute } from 'astro';
import { ARTWORK_PAGE_SIZE, getArtworkPage } from '@dearbloom/shared';
import { SITE_URL } from '@/lib/site';

/** 실제 콘텐츠가 있는 정적 페이지. 작가·검색·카테고리 등은 아직 플레이스홀더라 넣지 않습니다. */
const STATIC_PATHS = ['/', '/snaps', '/privacy-policy'];

/** 커서 루프 상한(40 × 50 = 2,000개). API 가 hasNext 를 잘못 내려줘도 무한 호출하지 않게 합니다. */
const MAX_PAGES = 50;

async function getArtworkPaths() {
  const paths: string[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < MAX_PAGES; i++) {
    const page = await getArtworkPage({ cursor, size: ARTWORK_PAGE_SIZE.MAX });
    paths.push(...page.artworkList.map((artwork) => `/snaps/${artwork.artworkId}`));
    if (!page.hasNext || !page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return paths;
}

export const GET: APIRoute = async () => {
  let artworkPaths: string[] = [];
  try {
    artworkPaths = await getArtworkPaths();
  } catch (e) {
    // 작품 API 가 실패해도 정적 페이지는 내려줍니다. 원인은 Vercel Runtime Logs 에서 확인.
    console.error('[sitemap] getArtworkPage 실패', e);
  }

  const urls = [...STATIC_PATHS, ...artworkPaths]
    .map((path) => `  <url><loc>${new URL(path, SITE_URL).toString()}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // 크롤러는 자주 오지 않으므로 CDN 에 1시간 올려 API 호출을 줄입니다.
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
