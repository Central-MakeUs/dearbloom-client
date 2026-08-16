/* global process */

import { networkInterfaces } from 'node:os';

import { IMAGE_WIDTHS } from './src/lib/imageSizes.mjs';

if (process.env.VERCEL && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('Vercel 배포에는 NEXT_PUBLIC_API_URL이 필요합니다.');
}

const localDevOrigins = Object.values(networkInterfaces())
  .flat()
  .filter((address) => address?.family === 'IPv4' && !address.internal)
  .map((address) => address.address);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: localDevOrigins,
  reactStrictMode: true,
  // dearbloom.co.kr/app/* 로 서빙되므로 basePath 지정.
  // 이로 인해 _next/static 등 정적 자산 경로도 /app/_next/static 으로 나감.
  basePath: '/app',
  /*
    이미지 최적화 — 작품 사진 원본이 장당 최대 2.4MB 인데 저장 목록·보드는 204px 카드로만 쓴다.
    그대로 내려보내면 한 화면에 수 MB 라 `/_next/image` 를 통해 webp + 표시 폭으로 줄여 내려준다.
    URL 은 src/lib/imageUrl.ts 가 직접 만든다(이유는 그 파일 주석 참고).
  */
  images: {
    // imageUrl.ts 와 같은 배열이어야 한다. deviceSizes 와 합쳐 허용 목록이 되고, 없는 w 는 거절된다.
    imageSizes: IMAGE_WIDTHS,
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
  async redirects() {
    return [
      {
        source: '/',
        destination: '/app',
        permanent: false,
        basePath: false,
      },
      {
        source: '/api/auth/callback',
        destination: '/app/api/auth/callback',
        permanent: false,
        basePath: false,
      },
    ];
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];

    return {
      fallback: [
        {
          source: '/:path*',
          destination: 'http://localhost:4321/:path*',
          basePath: false,
        },
      ],
    };
  },
  transpilePackages: [
    '@dearbloom/ui',
    '@dearbloom/mobile',
    '@dearbloom/shared',
    '@dearbloom/features-account',
    '@dearbloom/features-auth',
    '@dearbloom/features-chat',
  ],
};

export default nextConfig;
