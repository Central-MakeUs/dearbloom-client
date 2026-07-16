/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // dearbloom.co.kr/app/* 로 서빙되므로 basePath 지정.
  // 이로 인해 _next/static 등 정적 자산 경로도 /app/_next/static 으로 나감.
  basePath: '/app',
  async redirects() {
    return [
      {
        source: '/api/auth/callback',
        destination: '/app/api/auth/callback',
        permanent: false,
        basePath: false,
      },
    ];
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
