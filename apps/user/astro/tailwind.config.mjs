import preset from '@dearbloom/config/tailwind-preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './src/**/*.{astro,html,ts,tsx,mdx}',
    '../../../packages/ui/src/**/*.{ts,tsx}',
    '../../../packages/shared/src/**/*.{ts,tsx}',
  ],
};
