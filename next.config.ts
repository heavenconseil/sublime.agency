import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@paper-design/shaders-react'],
  headers: async () => [
    {
      // Fonts — immutable, 1 year
      source: '/fonts/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      // Sounds — immutable, 1 year
      source: '/sounds/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      // Images — 1 month
      source: '/:path*.(png|jpg|jpeg|webp|avif|ico|svg)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
      ],
    },
    {
      // Static text files — 1 week, revalidate daily
      source: '/:path*.(txt|xml)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
      ],
    },
    {
      // Security headers on all routes
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ],
};

export default nextConfig;
