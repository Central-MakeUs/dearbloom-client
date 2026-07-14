import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [tailwind({ applyBaseStyles: true }), react()],
  server: { port: 4321 },
  vite: {
    ssr: {
      // workspace 패키지를 Vite가 트랜스파일하도록
      noExternal: ['@dearbloom/ui', '@dearbloom/shared'],
    },
  },
});
