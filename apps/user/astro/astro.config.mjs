import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  // 기본은 정적(SSG). 서버렌더가 필요한 페이지만 `export const prerender = false` 로 옵트인.
  // 어댑터가 있어야 on-demand(SSR) 페이지를 배포할 수 있음.
  adapter: vercel(),
  integrations: [tailwind({ applyBaseStyles: true }), react()],
  server: { port: 4321 },
  vite: {
    ssr: {
      // workspace 패키지를 Vite가 트랜스파일하도록
      noExternal: ['@dearbloom/ui', '@dearbloom/shared'],
    },
  },
});
