import type { APIRoute } from 'astro';
import { SITE_URL } from '@/lib/site';

/**
 * 운영 배포(main → Vercel Production)에서만 크롤링을 허용합니다.
 * dev.dearbloom.co.kr(develop → Preview)·PR 프리뷰·로컬은 VERCEL_ENV 가 production 이 아니라 전부 막힙니다.
 * 배포 단위로 정해지는 값이라 빌드 때 정적으로 만듭니다.
 * /app(Next 로그인 영역)·/api·필터 화면은 검색 결과로 쓸 내용이 없어 제외합니다.
 */
export const GET: APIRoute = () => {
  const isProduction = process.env.VERCEL_ENV === 'production';
  const lines = isProduction
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

  return new Response(`${lines.join('\n')}\n`);
};
