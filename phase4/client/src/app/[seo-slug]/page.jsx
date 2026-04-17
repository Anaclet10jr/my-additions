/**
 * SEO Landing Page — /[seo-slug]
 * e.g. /houses-for-rent-kigali, /apartments-kicukiro
 * Statically generated with generateStaticParams
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEO_LANDING_PAGES, buildMetadata, breadcrumbJsonLd } from '../../lib/seo';

// ─── Generate static pages at build time ─────────────────
export async function generateStaticParams() {
  return SEO_LANDING_PAGES.map((page) => ({ slug: page.slug }));
}

// ─── Dynamic metadata ─────────────────────────────────────
export async function generateMetadata({ params }) {
  const page = SEO_LANDING_PAGES.find((p) => p.slug === params.slug);
  if (!page) return {};

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    keywords: page.keywords,
    type: 'website',
  });
}

// ─── Page component ───────────────────────────────────────
export default async function SeoLandingPage({ params }) {
  const page = SEO_LANDING_PAGES.find((p) => p.slug === params.slug);
  if (!page) notFound();

  // Build filter URL for the search page
  const filterParams = new URLSearchParams();
  if (page.type) filterParams.set('type', page.type);
  if (page.district) filterParams.set('district', page.district);
  if (page.sector) filterParams.set('sector', page.sector);
  if (page.category) filterParams.set('category', page.category);
  const searchUrl = page.linkTo || `/search?${filterParams.toString()}`;

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: page.title, path: `/${page.slug}` },
  ]);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <main style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        {/* ─── Hero section ────────────────────────────── */}
        <section
          style={{
            background: 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-primary) 100%)',
            padding: '4rem 1.5rem',
            color: 'white',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <nav style={{ marginBottom: '1rem', fontSize: '0.85rem', opacity: 0.8 }}>
              <Link href="/" style={{ color: 'white' }}>Home</Link>
              <span style={{ margin: '0 0.5rem' }}>›</span>
              <span>{page.title}</span>
            </nav>

            <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: '1rem', color: 'white' }}>
              {page.h1}
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.7, marginBottom: '2rem' }}>
              {page.intro}
            </p>

            <Link
              href={searchUrl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 2rem',
                background: 'white',
                color: 'var(--brand-dark)',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s ease',
              }}
            >
              🔍 Browse Listings
            </Link>
          </div>
        </section>

        {/* ─── Why Nyumba.rw section ────────────────────── */}
        <section style={{ padding: '3rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2.5rem' }}>Why Use Nyumba.rw?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '✅', title: 'Verified Listings', desc: 'Every listing is reviewed and verified before going live.' },
              { icon: '🔴', title: 'Real-Time Availability', desc: 'Booking status updates instantly across all devices.' },
              { icon: '📜', title: 'Digital Contracts', desc: 'Sign rental agreements online — legally binding.' },
              { icon: '📱', title: 'MTN & Airtel Pay', desc: 'Pay securely via MTN MoMo or Airtel Money.' },
              { icon: '🛡️', title: 'Fraud Protection', desc: 'Report fake listings. Our team investigates within 24h.' },
              { icon: '🌍', title: 'EN / FR / Kinyarwanda', desc: 'The platform speaks your language.' },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Related SEO pages ────────────────────────── */}
        <section style={{ padding: '2rem 1.5rem 4rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Explore More Listings</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {SEO_LANDING_PAGES.filter((p) => p.slug !== page.slug).map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'all var(--transition)',
                }}
              >
                {p.title}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
