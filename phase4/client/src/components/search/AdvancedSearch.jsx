/**
 * AdvancedSearch — Full filter panel for properties
 * Used on /rentals, /real-estate, and search results
 * Syncs with URL query params via Next.js router
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

const DISTRICTS = [
  'Gasabo', 'Kicukiro', 'Nyarugenge',
  'Musanze', 'Rubavu', 'Huye', 'Muhanga',
  'Rwamagana', 'Kayonza', 'Bugesera',
];

const AMENITIES_LIST = [
  { key: 'wifi', icon: '📶', label: 'WiFi' },
  { key: 'electricity', icon: '⚡', label: 'Electricity' },
  { key: 'water', icon: '💧', label: 'Water' },
  { key: 'generator', icon: '🔋', label: 'Generator' },
  { key: 'security_guard', icon: '💂', label: 'Security' },
  { key: 'cctv', icon: '📹', label: 'CCTV' },
  { key: 'parking', icon: '🚗', label: 'Parking' },
  { key: 'garden', icon: '🌿', label: 'Garden' },
  { key: 'swimming_pool', icon: '🏊', label: 'Pool' },
  { key: 'gym', icon: '🏋️', label: 'Gym' },
  { key: 'elevator', icon: '🛗', label: 'Elevator' },
  { key: 'balcony', icon: '🌅', label: 'Balcony' },
  { key: 'air_conditioning', icon: '❄️', label: 'AC' },
  { key: 'solar_power', icon: '☀️', label: 'Solar' },
];

const DEFAULT_FILTERS = {
  type: '',
  category: '',
  district: '',
  sector: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  furnished: '',
  amenities: [],
  isAvailable: false,
  isVerified: false,
  sortBy: '-createdAt',
  search: '',
};

export default function AdvancedSearch({ onSearch, compact = false, initialType = '' }) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, type: initialType });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeCount, setActiveCount] = useState(0);

  // Sync from URL params on mount
  useEffect(() => {
    const params = {};
    for (const [key, val] of searchParams.entries()) {
      if (key === 'amenities') {
        params[key] = val.split(',');
      } else if (key === 'isAvailable' || key === 'isVerified') {
        params[key] = val === 'true';
      } else {
        params[key] = val;
      }
    }
    if (Object.keys(params).length > 0) {
      setFilters((f) => ({ ...f, ...params }));
      if (params.district || params.minPrice || params.maxPrice || params.bedrooms || params.amenities?.length) {
        setShowAdvanced(true);
      }
    }
  }, []);

  // Count active filters for badge
  useEffect(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.category) count++;
    if (filters.district) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.furnished) count++;
    if (filters.amenities.length) count += filters.amenities.length;
    if (filters.isAvailable) count++;
    if (filters.isVerified) count++;
    setActiveCount(count);
  }, [filters]);

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (key) => {
    setFilters((f) => ({
      ...f,
      amenities: f.amenities.includes(key)
        ? f.amenities.filter((a) => a !== key)
        : [...f.amenities, key],
    }));
  };

  const handleSearch = useCallback(() => {
    // Build query params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (!val || val === '' || (Array.isArray(val) && val.length === 0)) return;
      if (Array.isArray(val)) {
        params.set(key, val.join(','));
      } else if (typeof val === 'boolean') {
        if (val) params.set(key, 'true');
      } else {
        params.set(key, val);
      }
    });

    const queryString = params.toString();
    router.push(`/search?${queryString}`, { scroll: false });
    onSearch?.(filters);
  }, [filters, router, onSearch]);

  const handleClear = () => {
    setFilters({ ...DEFAULT_FILTERS, type: initialType });
    router.push('/search', { scroll: false });
    onSearch?.(DEFAULT_FILTERS);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color var(--transition)',
    fontFamily: 'inherit',
  };

  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '0.3rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-xl)',
        padding: compact ? '1rem' : '1.5rem',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* ─── Main search bar ───────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }}>
            🔍
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('home.search_placeholder')}
            style={{ ...inputStyle, paddingLeft: '2.5rem' }}
          />
        </div>

        <select value={filters.type} onChange={(e) => set('type', e.target.value)} style={{ ...selectStyle, flex: '0 1 150px' }}>
          <option value="">{t('search.property_type')}</option>
          <option value="rent">{t('home.categories.rent')}</option>
          <option value="sale">{t('home.categories.sale')}</option>
          <option value="short_stay">{t('home.categories.short_stay')}</option>
        </select>

        <select value={filters.district} onChange={(e) => set('district', e.target.value)} style={{ ...selectStyle, flex: '0 1 160px' }}>
          <option value="">{t('search.district')}</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <button
          onClick={() => setShowAdvanced((s) => !s)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.625rem 1rem',
            background: showAdvanced ? 'var(--brand-bg)' : 'var(--bg-secondary)',
            border: `1px solid ${showAdvanced ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
            borderRadius: 'var(--radius-md)',
            color: showAdvanced ? 'var(--brand-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            transition: 'all var(--transition)',
          }}
        >
          ⚙️ {t('search.filters')}
          {activeCount > 0 && (
            <span style={{
              background: 'var(--brand-primary)',
              color: 'white',
              borderRadius: '999px',
              padding: '0.1rem 0.45rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              lineHeight: 1.4,
            }}>
              {activeCount}
            </span>
          )}
        </button>

        <button
          onClick={handleSearch}
          style={{
            padding: '0.625rem 1.5rem',
            background: 'var(--brand-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            transition: 'all var(--transition)',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          {t('home.search_btn')}
        </button>
      </div>

      {/* ─── Advanced filters panel ────────────────────── */}
      {showAdvanced && (
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', animation: 'fadeUp 0.2s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>

            {/* Category */}
            <div>
              <label style={labelStyle}>{t('search.category')}</label>
              <select value={filters.category} onChange={(e) => set('category', e.target.value)} style={selectStyle}>
                <option value="">All</option>
                {['apartment','house','villa','studio','land','commercial','room'].map((c) => (
                  <option key={c} value={c}>{t(`property.categories.${c}`)}</option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label style={labelStyle}>{t('search.bedrooms')}</label>
              <select value={filters.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} style={selectStyle}>
                <option value="">Any</option>
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>

            {/* Furnished */}
            <div>
              <label style={labelStyle}>{t('search.furnished')}</label>
              <select value={filters.furnished} onChange={(e) => set('furnished', e.target.value)} style={selectStyle}>
                <option value="">Any</option>
                <option value="unfurnished">{t('property.furnished_types.unfurnished')}</option>
                <option value="semi_furnished">{t('property.furnished_types.semi_furnished')}</option>
                <option value="fully_furnished">{t('property.furnished_types.fully_furnished')}</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label style={labelStyle}>{t('search.sort')}</label>
              <select value={filters.sortBy} onChange={(e) => set('sortBy', e.target.value)} style={selectStyle}>
                <option value="-createdAt">{t('search.sort_options.newest')}</option>
                <option value="price.amount">{t('search.sort_options.price_asc')}</option>
                <option value="-price.amount">{t('search.sort_options.price_desc')}</option>
                <option value="-views">{t('search.sort_options.most_viewed')}</option>
              </select>
            </div>

            {/* Min price */}
            <div>
              <label style={labelStyle}>{t('search.min_price')}</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => set('minPrice', e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>

            {/* Max price */}
            <div>
              <label style={labelStyle}>{t('search.max_price')}</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => set('maxPrice', e.target.value)}
                placeholder="5,000,000"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { key: 'isAvailable', label: t('search.available_only') },
              { key: 'isVerified', label: t('search.verified_only') },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={filters[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
                {label}
              </label>
            ))}
          </div>

          {/* Amenities */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ ...labelStyle, marginBottom: '0.6rem' }}>{t('search.amenities')}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {AMENITIES_LIST.map(({ key, icon, label }) => {
                const active = filters.amenities.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleAmenity(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${active ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                      background: active ? 'var(--brand-bg)' : 'var(--bg-secondary)',
                      color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all var(--transition)',
                    }}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={handleClear}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all var(--transition)',
              }}
            >
              {t('search.clear')}
            </button>
            <button
              onClick={handleSearch}
              style={{
                padding: '0.5rem 1.5rem',
                background: 'var(--brand-primary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all var(--transition)',
              }}
            >
              {t('search.apply')} {activeCount > 0 && `(${activeCount})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
