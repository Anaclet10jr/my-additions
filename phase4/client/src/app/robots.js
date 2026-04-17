/**
 * /robots.txt — Next.js App Router robots.js convention
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nyumba.rw';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/login',
          '/register',
          '/reset-password',
          '/verify-email',
        ],
      },
      {
        // Block AI training scrapers
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai'],
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
