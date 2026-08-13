/* global process */

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import { IMAGE_WIDTHS } from './src/lib/imageSizes.mjs';

if (process.env.VERCEL && !process.env.NEXT_PUBLIC_API_URL && !process.env.PUBLIC_API_URL) {
  throw new Error('Vercel 배포에는 NEXT_PUBLIC_API_URL 또는 PUBLIC_API_URL이 필요합니다.');
}

export default defineConfig({
  // 기본은 정적(SSG). 서버렌더가 필요한 페이지만 `export const prerender = false` 로 옵트인.
  // 어댑터가 있어야 on-demand(SSR) 페이지를 배포할 수 있음.
  adapter: vercel({
    /*
      이미지 최적화 — 작품 사진 원본이 장당 최대 2.4MB(목록 한 화면 14MB)라 그대로 내려보내면
      느릴 수밖에 없다. `/_vercel/image` 를 통해 webp + 표시 폭으로 줄여 내려준다.
      URL 은 src/lib/imageUrl.ts 가 직접 만든다(이유는 그 파일 주석 참고).
    */
    imageService: true,
    imagesConfig: {
      // imageUrl.ts 와 같은 배열이어야 한다. 여기 없는 w 는 거절된다.
      sizes: IMAGE_WIDTHS,
      domains: [],
      // 작품 사진은 API 가 내려주는 CDN 절대 URL — 우리 도메인만 최적화를 허용한다.
      remotePatterns: [
        { protocol: 'https', hostname: 'dev-cdn.dearbloom.co.kr' },
        { protocol: 'https', hostname: 'cdn.dearbloom.co.kr' },
        { protocol: 'https', hostname: '**.dearbloom.co.kr' },
      ],
      formats: ['image/webp'],
      // 포트폴리오 사진은 같은 URL 로 갈아끼우지 않으므로 길게 잡는다(30일).
      minimumCacheTTL: 60 * 60 * 24 * 30,
    },
  }),
  integrations: [tailwind({ applyBaseStyles: true }), react()],
  server: { port: 4321 },
  vite: {
    ssr: {
      // workspace 패키지를 Vite가 트랜스파일하도록
      noExternal: ['@dearbloom/ui', '@dearbloom/shared'],
    },
  },
});
