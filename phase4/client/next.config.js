/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Image optimization ─────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
  },

  // ─── Performance ─────────────────────────────────────────
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },

  // ─── Compression ─────────────────────────────────────────
  compress: true,

  // ─── Headers for security & caching ─────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
      {
        // Cache static assets for 1 year
        source: '/icons/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },

  // ─── Redirects for SEO ───────────────────────────────────
  async redirects() {
    return [
      { source: '/rent', destination: '/rentals', permanent: true },
      { source: '/buy', destination: '/real-estate', permanent: true },
      { source: '/design', destination: '/interior-design', permanent: true },
      { source: '/repair', destination: '/home-services', permanent: true },
    ];
  },

  // ─── i18n (basic) ────────────────────────────────────────
  // Full i18n handled client-side via LanguageContext
  // This just ensures correct lang detection for crawlers
  i18n: {
    locales: ['en', 'fr', 'rw'],
    defaultLocale: 'en',
    localeDetection: false, // We handle this in context
  },

  // ─── Bundle analyzer (run with ANALYZE=true) ─────────────
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')();
      if (!isServer) config.plugins.push(new BundleAnalyzerPlugin());
      return config;
    },
  }),
};

module.exports = nextConfig;
