'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';

const DISTRICTS = [
  'Gasabo','Kicukiro','Nyarugenge','Bugesera','Gatsibo',
  'Kayonza','Kirehe','Maranavicino','Ngoma','Nyagatare','Rwamagana'
];

const TYPES = ['house','apartment','land','commercial','villa'];

export default function RealEstatePage() {
  const [listings,     setListings]     = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('buy');   // 'buy' | 'sell'
  const [filters,      setFilters]      = useState({
    district: '', propertyType: '', minPrice: '', maxPrice: '', bedrooms: '',
  });
  const [sort, setSort] = useState('newest');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        listingType: activeTab,
        page,
        sort,
        ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)),
      };
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/real-estate`, { params });
      setListings(data.listings);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, filters, sort]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const formatPrice = (n) => new Intl.NumberFormat('rw').format(n);

  const statusColor = {
    available:   'bg-emerald-100 text-emerald-800',
    under_offer: 'bg-amber-100 text-amber-800',
    sold:        'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Real Estate in Rwanda</h1>
          <p className="text-slate-300 mb-8">Find your perfect property — buy or invest</p>

          {/* Buy / Sell tab */}
          <div className="flex gap-2 mb-6">
            {['buy','sell'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`px-6 py-2.5 rounded-full font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'bg-white text-slate-800'
                    : 'border border-white/40 text-white hover:bg-white/10'
                }`}
              >
                {tab === 'buy' ? '🏠 Buy' : '💼 Sell / List'}
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap gap-3">
            <select
              className="bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 text-sm"
              value={filters.district}
              onChange={e => handleFilter('district', e.target.value)}
            >
              <option value="">All Districts</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              className="bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 text-sm"
              value={filters.propertyType}
              onChange={e => handleFilter('propertyType', e.target.value)}
            >
              <option value="">All Types</option>
              {TYPES.map(t => <option key={t} value={t} className="capitalize text-black">{t}</option>)}
            </select>

            <input
              type="number"
              placeholder="Min price (RWF)"
              className="bg-white/10 border border-white/30 text-white placeholder-white/50 rounded-lg px-3 py-2 text-sm w-40"
              value={filters.minPrice}
              onChange={e => handleFilter('minPrice', e.target.value)}
            />
            <input
              type="number"
              placeholder="Max price (RWF)"
              className="bg-white/10 border border-white/30 text-white placeholder-white/50 rounded-lg px-3 py-2 text-sm w-40"
              value={filters.maxPrice}
              onChange={e => handleFilter('maxPrice', e.target.value)}
            />

            <select
              className="bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 text-sm"
              value={filters.bedrooms}
              onChange={e => handleFilter('bedrooms', e.target.value)}
            >
              <option value="">Bedrooms</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>

            {Object.values(filters).some(Boolean) && (
              <button
                onClick={() => { setFilters({ district:'',propertyType:'',minPrice:'',maxPrice:'',bedrooms:'' }); setPage(1); }}
                className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Listings grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 text-sm">{total} propert{total !== 1 ? 'ies' : 'y'} found</p>
          <div className="flex gap-3 items-center">
            <select
              className="border rounded-lg px-3 py-2 text-sm text-gray-700"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="featured">Featured</option>
            </select>
            <Link
              href="/real-estate/list"
              className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition"
            >
              + List Property
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🏗️</div>
            <p className="text-lg">No properties found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(p => (
              <Link key={p._id} href={`/real-estate/${p._id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={p.images?.[0] || '/placeholder-property.jpg'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {p.isFeatured && (
                      <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                    <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${statusColor[p.status]}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-slate-700">{p.title}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">📍 {p.location?.district}, {p.location?.address}</p>
                    <div className="flex gap-3 mt-2 text-gray-500 text-xs">
                      {p.features?.bedrooms > 0 && <span>🛏 {p.features.bedrooms} bed</span>}
                      {p.features?.bathrooms > 0 && <span>🚿 {p.features.bathrooms} bath</span>}
                      {p.features?.area && <span>📐 {p.features.area}m²</span>}
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className="font-bold text-slate-800 text-lg">
                        {formatPrice(p.price)} <span className="text-xs font-normal text-gray-400">RWF</span>
                      </p>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded capitalize">{p.propertyType}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <button
              disabled={page >= Math.ceil(total / 12)}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
