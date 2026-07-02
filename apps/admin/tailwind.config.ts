import type { Config } from 'tailwindcss';
import preset from '@dearbloom/config/tailwind-preset';

const config: Config = {
  presets: [preset],
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './src/**/*.{ts,tsx,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/features/**/src/**/*.{ts,tsx}',
  ],
};

export default config;
