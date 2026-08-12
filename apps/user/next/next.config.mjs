/* global process */

import { networkInterfaces } from 'node:os';

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
