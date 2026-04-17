'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';

const CATEGORIES = [
  { key: 'plumbing',       label: '🔧 Plumbing' },
  { key: 'electrical',     label: '⚡ Electrical' },
  { key: 'painting',       label: '🖌 Painting' },
  { key: 'roofing',        label: '🏠 Roofing' },
  { key: 'tiling',         label: '🪟 Tiling' },
  { key: 'carpentry',      label: '🪚 Carpentry' },
  { key: 'masonry',        label: '🧱 Masonry' },
  { key: 'cleaning',       label: '🧹 Cleaning' },
  { key: 'landscaping',    label: '🌿 Landscaping' },
  { key: 'renovation',     label: '🔨 Renovation' },
  { key: 'solar',          label: '☀️ Solar' },
  { key: 'security',       label: '🔒 Security' },
  { key: 'pest_control',   label: '🐛 Pest Control' },
  { key: 'interior_fit_out',label: '🛋 Interior Fit-Out' },
];

const DISTRICTS = ['Gasabo','Kicukiro','Nyarugenge','Bugesera','Kayonza','Rwamagana'];

export default function HomeServicesPage() {
  const [services,    setServices]    = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [category,    setCategory]    = useState('');
  const [district,    setDistrict]    = useState('');
  const [sort,        setSort]        = useState('rating');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, sort };
      if (category) params.category = category;
      if (district) params.district = district;
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, { params });
      setServices(data.services);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, category, district, sort]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const renderStars = (avg) => {
    return '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Home Repair & Services</h1>
          <p className="text-orange-100 mb-8">Trusted local professionals for every home project</p>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setCategory(''); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                !category ? 'bg-white text-orange-600' : 'bg-white/15 hover:bg-white/25'
              }`}
            >
              All Services
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => { setCategory(c.key); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  category === c.key ? 'bg-white text-orange-600' : 'bg-white/15 hover:bg-white/25'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={district}
              onChange={e => { setDistrict(e.target.value); setPage(1); }}
            >
              <option value="">All Districts</option>
              {DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="rating">Best Rated</option>
              <option value="jobs">Most Jobs</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div className="flex gap-3">
            <p className="text-gray-500 text-sm self-center">{total} providers</p>
            <Link
              href="/home-services/list"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + List your Service
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow animate-pulse space-y-3">
                <div className="h-36 bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔧</div>
            <p>No services found for your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(svc => (
              <Link key={svc._id} href={`/home-services/${svc._id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 group">
                  <div className="h-40 overflow-hidden">
                    <img
                      src={svc.coverImage || svc.images?.[0] || '/placeholder-service.jpg'}
                      alt={svc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 leading-tight">{svc.name}</h3>
                      {svc.isVerified && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{svc.description}</p>

                    <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                      <span>{renderStars(svc.rating?.average || 0)}</span>
                      <span className="text-gray-500 text-xs ml-1">({svc.rating?.count || 0})</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-400">
                        {svc.totalJobs} job{svc.totalJobs !== 1 ? 's' : ''} completed
                      </div>
                      <div className="text-sm font-semibold text-gray-700">
                        {svc.priceModel === 'fixed' && `${svc.basePrice?.toLocaleString()} RWF`}
                        {svc.priceModel === 'hourly' && `${svc.basePrice?.toLocaleString()} RWF/hr`}
                        {svc.priceModel === 'quote' && 'Quote on request'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-600">
                        {svc.provider?.avatar
                          ? <img src={svc.provider.avatar} className="w-full h-full object-cover" />
                          : svc.provider?.name?.[0]}
                      </div>
                      <span className="text-sm text-gray-600">{svc.provider?.name}</span>
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
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100">← Prev</button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {Math.ceil(total/12)}</span>
            <button disabled={page>=Math.ceil(total/12)} onClick={() => setPage(p=>p+1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
