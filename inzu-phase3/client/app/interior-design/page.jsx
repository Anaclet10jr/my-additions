'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';

const STYLES = [
  'modern','contemporary','traditional','minimalist',
  'rustic','industrial','scandinavian','bohemian','african_fusion','luxury'
];

const ROOM_TYPES = [
  'living_room','bedroom','kitchen','bathroom',
  'office','dining_room','outdoor','full_home','commercial'
];

const styleLabel = s => s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function InteriorDesignPage() {
  const [projects,  setProjects]  = useState([]);
  const [designers, setDesigners] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('projects');   // 'projects' | 'designers'
  const [style,     setStyle]     = useState('');
  const [roomType,  setRoomType]  = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'projects') {
        const params = { page };
        if (style)    params.style    = style;
        if (roomType) params.roomType = roomType;
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/interior`, { params });
        setProjects(data.projects);
        setTotal(data.total);
      } else {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/interior/designers`);
        setDesigners(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab, page, style, roomType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-stone-800 via-stone-700 to-amber-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Interior Design</h1>
          <p className="text-stone-300 mb-8">Transform your space with Rwanda's top designers</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['projects','designers'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1); }}
                className={`px-6 py-2.5 rounded-full font-semibold capitalize transition ${
                  tab === t ? 'bg-white text-stone-800' : 'border border-white/30 hover:bg-white/10'
                }`}
              >
                {t === 'projects' ? '🖼 Portfolio' : '👤 Designers'}
              </button>
            ))}
          </div>

          {/* Filters (projects tab only) */}
          {tab === 'projects' && (
            <div className="flex flex-wrap gap-3">
              <select
                className="bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 text-sm"
                value={style}
                onChange={e => { setStyle(e.target.value); setPage(1); }}
              >
                <option value="">All Styles</option>
                {STYLES.map(s => (
                  <option key={s} value={s} className="text-black">{styleLabel(s)}</option>
                ))}
              </select>
              <select
                className="bg-white/10 border border-white/30 text-white rounded-lg px-3 py-2 text-sm"
                value={roomType}
                onChange={e => { setRoomType(e.target.value); setPage(1); }}
              >
                <option value="">All Rooms</option>
                {ROOM_TYPES.map(r => (
                  <option key={r} value={r} className="text-black">{styleLabel(r)}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-500 text-sm">
            {tab === 'projects' ? `${total} projects` : `${designers.length} designers`}
          </p>
          <div className="flex gap-3">
            <Link
              href="/interior-design/portfolio"
              className="border border-stone-600 text-stone-700 px-4 py-2 rounded-lg text-sm hover:bg-stone-100 transition"
            >
              + Add to Portfolio
            </Link>
            <Link
              href="/interior-design/request"
              className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-700 transition"
            >
              Request Design
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_,i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : tab === 'projects' ? (
          <>
            {projects.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">🛋</div>
                <p>No projects found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(proj => (
                  <Link key={proj._id} href={`/interior-design/${proj._id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300 group">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={proj.after?.[0] || '/placeholder-interior.jpg'}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {proj.isFeatured && (
                          <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">⭐ Featured</span>
                        )}
                        {proj.style && (
                          <span className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            {styleLabel(proj.style)}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 line-clamp-1">{proj.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden text-xs flex items-center justify-center font-bold text-stone-600">
                            {proj.designer?.name?.[0]}
                          </div>
                          <span className="text-sm text-gray-500">{proj.designer?.name}</span>
                        </div>
                        {proj.roomType?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proj.roomType.slice(0,2).map(r => (
                              <span key={r} className="bg-stone-100 text-stone-600 text-xs px-2 py-0.5 rounded">{styleLabel(r)}</span>
                            ))}
                          </div>
                        )}
                        {proj.budget?.min && (
                          <p className="text-sm font-semibold text-stone-700 mt-3">
                            From {proj.budget.min.toLocaleString()} RWF
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {total > 12 && (
              <div className="flex justify-center gap-2 mt-10">
                <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40">← Prev</button>
                <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {Math.ceil(total/12)}</span>
                <button disabled={page>=Math.ceil(total/12)} onClick={() => setPage(p=>p+1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        ) : (
          /* Designers grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {designers.map(d => (
              <Link key={d._id} href={`/interior-design/designer/${d._id}`}>
                <div className="bg-white rounded-2xl p-6 shadow text-center hover:shadow-xl transition group">
                  <div className="w-20 h-20 rounded-full mx-auto overflow-hidden bg-stone-200 flex items-center justify-center text-2xl font-bold text-stone-600 mb-4">
                    {d.avatar
                      ? <img src={d.avatar} className="w-full h-full object-cover" />
                      : d.name?.[0]}
                  </div>
                  <h3 className="font-semibold text-gray-800">{d.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{d.bio}</p>
                  <button className="mt-4 text-stone-600 border border-stone-300 px-4 py-2 rounded-lg text-sm hover:bg-stone-50 transition w-full">
                    View Portfolio
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
