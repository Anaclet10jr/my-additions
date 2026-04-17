/**
 * /sitemap.xml — Dynamic sitemap for Google indexing
 * Next.js App Router sitemap.js convention
 */

import { SEO_LANDING_PAGES } from '../lib/seo';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nyumba.rw';

export default async function sitemap() {
  // ─── Static pages ─────────────────────────────────────
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/rentals`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/real-estate`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/home-services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/interior-design`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'always', priority: 0.7 },
  ];

  // ─── SEO landing pages ────────────────────────────────
  const seoPages = SEO_LANDING_PAGES.map((page) => ({
    url: `${BASE_URL}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // ─── Dynamic property pages from API ─────────────────
  let propertyPages = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties?limit=500&status=approved`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (res.ok) {
      const data = await res.json();
      propertyPages = (data.data || []).map((p) => ({
        url: `${BASE_URL}/properties/${p.slug}`,
        lastModified: new Date(p.updatedAt || p.createdAt),
        changeFrequency: 'daily',
        priority: 0.7,
      }));
    }
  } catch {
    // API unreachable during build — skip dynamic pages
    console.warn('[Sitemap] Could not fetch properties from API');
  }

  return [...staticPages, ...seoPages, ...propertyPages];
}
