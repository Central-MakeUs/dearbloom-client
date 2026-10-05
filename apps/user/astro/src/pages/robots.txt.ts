export const prerender = false; // 요청 호스트로 운영/개발을 가르므로 서버 렌더

import type { APIRoute } from 'astro';
import { SITE_URL } from '@/lib/site';

/**
 * 운영 도메인에서만 크롤링을 허용합니다. dev.dearbloom.co.kr·*.vercel.app 프리뷰는 전부 막습니다.
 * /app(Next 로그인 영역)·/api·필터 화면은 검색 결과로 쓸 내용이 없어 제외합니다.
 */
export const GET: APIRoute = ({ url }) => {
  const isProductionHost = url.origin === SITE_URL;
  const lines = isProductionHost
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Disallow: /app',
        'Disallow: /snaps/filter',
        '',
        `Sitemap: ${SITE_URL}/sitemap.xml`,
      ]
    : ['User-agent: *', 'Disallow: /'];

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
};
