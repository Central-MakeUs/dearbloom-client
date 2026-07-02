/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@dearbloom/ui',
    '@dearbloom/shared',
    '@dearbloom/features-auth',
  ],
};

export default nextConfig;
