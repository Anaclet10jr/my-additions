/**
 * SEO utilities for Nyumba.rw
 * Generates meta tags, OG tags, structured data (JSON-LD)
 * Compatible with Next.js 14 Metadata API
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nyumba.rw';
const SITE_NAME = 'Nyumba.rw';
const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

// ─── Base metadata factory ────────────────────────────────
export function buildMetadata({
  title,
  description,
  path = '',
  image,
  type = 'website',
  noIndex = false,
  keywords = [],
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Rwanda's #1 Property Platform`;
  const url = `${BASE_URL}${path}`;
  const ogImage = image || DEFAULT_IMAGE;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
      type,
      locale: 'en_RW',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

// ─── Property listing JSON-LD ─────────────────────────────
export function propertyJsonLd(property) {
  return {
    '@context': 'https://schema.org',
    '@type': property.type === 'sale' ? 'RealEstateListing' : 'Accommodation',
    name: property.title,
    description: property.description,
    url: `${BASE_URL}/properties/${property.slug}`,
    image: property.images?.map((img) => img.url) || [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location?.sector || '',
      addressRegion: property.location?.district || 'Kigali',
      addressCountry: 'RW',
    },
    offers: {
      '@type': 'Offer',
      price: property.price?.amount,
      priceCurrency: property.price?.currency || 'RWF',
      availability: property.isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    numberOfRooms: property.features?.bedrooms,
    floorSize: property.features?.size
      ? { '@type': 'QuantitativeValue', value: property.features.size, unitCode: 'MTK' }
      : undefined,
  };
}

// ─── Organization JSON-LD (site-wide) ────────────────────
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+250-XXX-XXX-XXX',
    contactType: 'customer service',
    areaServed: 'RW',
    availableLanguage: ['English', 'French', 'Kinyarwanda'],
  },
  sameAs: [
    'https://twitter.com/nyumbarw',
    'https://facebook.com/nyumbarw',
  ],
};

// ─── Breadcrumb JSON-LD ───────────────────────────────────
export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}

// ─── SEO landing page configs ─────────────────────────────
// These generate static pages like /kigali-rentals, /apartments-kicukiro
export const SEO_LANDING_PAGES = [
  {
    slug: 'houses-for-rent-kigali',
    title: 'Houses for Rent in Kigali',
    description: 'Find affordable houses for rent in Kigali, Rwanda. Browse verified listings in Gasabo, Kicukiro, and Nyarugenge districts.',
    keywords: ['houses for rent kigali', 'kigali rental houses', 'inzu zokodesha kigali', 'maisons à louer kigali'],
    type: 'rent',
    district: 'Kigali',
    category: 'house',
    h1: 'Houses for Rent in Kigali',
    intro: 'Discover the best houses for rent across Kigali's three districts — Gasabo, Kicukiro, and Nyarugenge. From affordable studio rooms to spacious family homes.',
  },
  {
    slug: 'apartments-kicukiro',
    title: 'Apartments in Kicukiro',
    description: 'Browse apartments for rent in Kicukiro, Kigali. Verified listings with real-time availability.',
    keywords: ['apartments kicukiro', 'kicukiro rentals', 'apatima kicukiro', 'appartements kicukiro'],
    type: 'rent',
    district: 'Kicukiro',
    category: 'apartment',
    h1: 'Apartments for Rent in Kicukiro',
    intro: 'Kicukiro is one of Kigali's fastest-growing districts. Find modern apartments with great amenities near major roads and shopping centers.',
  },
  {
    slug: 'homes-nyarutarama',
    title: 'Homes in Nyarutarama',
    description: 'Luxury homes and apartments in Nyarutarama, Kigali. Browse premium properties in Rwanda's most sought-after neighborhood.',
    keywords: ['nyarutarama homes', 'nyarutarama apartments', 'luxury homes kigali', 'nyarutarama rentals'],
    type: 'rent',
    district: 'Gasabo',
    sector: 'Nyarutarama',
    h1: 'Homes in Nyarutarama, Kigali',
    intro: 'Nyarutarama is Kigali\'s premium residential neighborhood. Find upscale homes, apartments, and villas with stunning city views.',
  },
  {
    slug: 'buy-land-kigali',
    title: 'Land for Sale in Kigali',
    description: 'Find land for sale in Kigali and across Rwanda. Verified plots in prime locations across all districts.',
    keywords: ['land for sale kigali', 'ubutaka bugurisha kigali', 'terrain à vendre kigali', 'kigali plots'],
    type: 'sale',
    category: 'land',
    h1: 'Land for Sale in Kigali, Rwanda',
    intro: 'Invest in Kigali\'s booming real estate market. Browse verified land plots in all districts with clear legal titles and fair prices.',
  },
  {
    slug: 'interior-designers-kigali',
    title: 'Interior Designers in Kigali',
    description: 'Connect with verified interior designers in Kigali, Rwanda. Transform your home with professional design services.',
    keywords: ['interior designers kigali', 'home design rwanda', 'interior design kigali', 'décorateurs intérieur kigali'],
    h1: 'Interior Designers in Kigali',
    intro: 'Find talented interior designers in Kigali who understand local tastes and international standards. From full renovations to décor consultations.',
    linkTo: '/interior-design',
  },
  {
    slug: 'homes-remera',
    title: 'Homes in Remera, Kigali',
    description: 'Find houses and apartments in Remera, Kigali. A vibrant neighborhood close to Kigali International Airport.',
    keywords: ['remera kigali homes', 'remera apartments', 'inzu remera', 'houses near airport kigali'],
    type: 'rent',
    district: 'Gasabo',
    sector: 'Remera',
    h1: 'Homes in Remera, Kigali',
    intro: 'Remera is a popular choice for expats and professionals. Find well-connected homes minutes from Kigali International Airport.',
  },
];
