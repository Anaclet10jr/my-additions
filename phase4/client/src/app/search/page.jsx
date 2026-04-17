/**
 * /search — Universal search results page
 * Reads URL params, fetches from API, renders property grid
 */
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdvancedSearch from '../../components/search/AdvancedSearch';
import { useLanguage } from '../../context/LanguageContext';
import { AdaptiveImage, LowBandwidthBanner } from '../../hooks/usePerformance';
import Link from 'next/link';

// ─── Property card ─────────────────────────────────────────
function PropertyCard({ property }) {
  const { t } = useLanguage();
  const primary = property.images?.find((i) => i.isPrimary) || property.images?.[0];

  return (
    <Link
      href={`/properties/${property.slug || property._id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article
        className="card"
        style={{ overflow: 'hidden', cursor: 'pointer' }}
      >
        {/* Image */}
        <AdaptiveImage
          src={primary?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600'}
          alt={property.title}
          style={{ height: '200px', position: 'relative' }}
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem' }}>
          <span className={`badge ${property.type === 'rent' ? 'badge-verified' : 'badge-premium'}`}>
            {t(`home.categories.${property.type}`)}
          </span>
          {property.isVerified && <span className="badge badge-verified">✓ {t('common.verified')}</span>}
        </div>

        {/* Content */}
        <div style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {property.title}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            📍 {property.location?.sector}, {property.location?.district}
          </p>

          {/* Features */}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
            {property.features?.bedrooms > 0 && <span>🛏 {property.features.bedrooms}</span>}
            {property.features?.bathrooms > 0 && <span>🚿 {property.features.bathrooms}</span>}
            {property.features?.size && <span>📐 {property.features.size}m²</span>}
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
              {property.price?.currency || 'RWF'} {property.price?.amount?.toLocaleString()}
              <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                {property.type === 'rent' ? t('property.per_month') : ''}
              </span>
            </p>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                background: property.isAvailable ? 'var(--brand-bg)' : '#FDECEA',
                color: property.isAvailable ? 'var(--brand-dark)' : 'var(--error)',
                fontWeight: 600,
              }}
            >
              {property.isAvailable ? t('property.available') : t('property.booked')}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Skeleton grid ────────────────────────────────────────
function SkeletonGrid({ count = 9 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ overflow: 'hidden' }}>
          <div className="skeleton" style={{ height: '200px' }} />
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="skeleton" style={{ height: '18px', width: '80%' }} />
            <div className="skeleton" style={{ height: '14px', width: '50%' }} />
            <div className="skeleton" style={{ height: '20px', width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main search page ─────────────────────────────────────
function SearchPageContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = async (params, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(params);
      query.set('page', pageNum);
      query.set('limit', '12');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties?${query}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      setProperties(data.data || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load from URL params
  useEffect(() => {
    const params = {};
    for (const [key, val] of searchParams.entries()) {
      params[key] = val;
    }
    fetchProperties(params);
  }, [searchParams]);

  const handleSearch = (filters) => {
    fetchProperties(filters, 1);
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <LowBandwidthBanner />

      {/* Search bar */}
      <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <AdvancedSearch onSearch={handleSearch} />
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Result count */}
        {!loading && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {total > 0
                ? t('search.results', { count: total })
                : t('search.no_results')}
            </p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <SkeletonGrid count={9} />
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--error)' }}>
            ⚠️ {t('common.error')}
          </div>
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('property.no_results')}</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => fetchProperties(Object.fromEntries(searchParams), page - 1)}
              disabled={page === 1}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-secondary)',
                color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
            >
              ← {t('common.previous')}
            </button>

            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchProperties(Object.fromEntries(searchParams), pageNum)}
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${pageNum === page ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                    background: pageNum === page ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: pageNum === page ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: pageNum === page ? 600 : 400,
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => fetchProperties(Object.fromEntries(searchParams), page + 1)}
              disabled={page === pages}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-secondary)',
                color: page === pages ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: page === pages ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {t('common.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
