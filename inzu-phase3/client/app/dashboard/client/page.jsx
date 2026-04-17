'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const STATUS_COLORS = {
  pending:     'bg-yellow-100 text-yellow-700',
  accepted:    'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700',
  quoted:      'bg-purple-100 text-purple-700',
  unavailable: 'bg-red-100 text-red-700',
  available:   'bg-green-100 text-green-700',
};

export default function ClientDashboard() {
  const router   = useRouter();
  const { user } = useAuth();
  const [tab,     setTab]     = useState('bookings');
  const [data,    setData]    = useState({ bookings: [], serviceRequests: [], designRequests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return router.push('/login');
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const API = process.env.NEXT_PUBLIC_API_URL;
        const [bRes, sRes, dRes] = await Promise.all([
          axios.get(`${API}/api/bookings/my`, { headers }),
          axios.get(`${API}/api/services/requests/my?role=client`, { headers }),
          axios.get(`${API}/api/interior/requests/my?role=client`, { headers }),
        ]);
        setData({
          bookings:       bRes.data || [],
          serviceRequests: sRes.data || [],
          designRequests:  dRes.data || [],
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const tabs = [
    { key: 'bookings',        label: '🏠 Rental Bookings',   count: data.bookings.length },
    { key: 'serviceRequests', label: '🔧 Service Requests',   count: data.serviceRequests.length },
    { key: 'designRequests',  label: '🛋 Design Requests',    count: data.designRequests.length },
  ];

  const formatDate = d => new Date(d).toLocaleDateString('en-RW', { day:'numeric', month:'short', year:'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/properties" className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Browse Rentals</Link>
            <Link href="/home-services" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600">Book a Service</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}>
              {t.label}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${tab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse shadow-sm" />)}
          </div>
        ) : (
          <>
            {/* Rental Bookings */}
            {tab === 'bookings' && (
              <div className="space-y-3">
                {data.bookings.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">🏠</div>
                    <p>No rental bookings yet.</p>
                    <Link href="/properties" className="text-blue-500 text-sm mt-2 inline-block hover:underline">Browse Properties →</Link>
                  </div>
                ) : data.bookings.map(b => (
                  <div key={b._id} className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{b.property?.title || 'Property'}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{formatDate(b.startDate)} → {formatDate(b.endDate)}</p>
                      <p className="text-gray-600 text-sm mt-1 font-medium">{b.totalPrice?.toLocaleString()} RWF</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Service Requests */}
            {tab === 'serviceRequests' && (
              <div className="space-y-3">
                {data.serviceRequests.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">🔧</div>
                    <p>No service requests yet.</p>
                    <Link href="/home-services" className="text-orange-500 text-sm mt-2 inline-block hover:underline">Browse Services →</Link>
                  </div>
                ) : data.serviceRequests.map(r => (
                  <div key={r._id} className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{r.service?.name || 'Service'}</p>
                      <p className="text-gray-400 text-sm mt-0.5 line-clamp-1">{r.description}</p>
                      <p className="text-gray-500 text-sm mt-1">📍 {r.address}</p>
                      {r.quotedPrice && <p className="text-gray-600 text-sm font-medium">Quote: {r.quotedPrice.toLocaleString()} RWF</p>}
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                        {r.status}
                      </span>
                      {r.status === 'completed' && !r.review?.rating && (
                        <button className="block mt-2 text-xs text-blue-500 hover:underline">Leave review</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Design Requests */}
            {tab === 'designRequests' && (
              <div className="space-y-3">
                {data.designRequests.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">🛋</div>
                    <p>No design requests yet.</p>
                    <Link href="/interior-design" className="text-stone-600 text-sm mt-2 inline-block hover:underline">Browse Designers →</Link>
                  </div>
                ) : data.designRequests.map(r => (
                  <div key={r._id} className="bg-white rounded-xl p-5 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800 capitalize">{r.projectType?.replace('_',' ')}</p>
                      <p className="text-gray-400 text-sm mt-0.5 line-clamp-1">{r.description}</p>
                      <p className="text-gray-500 text-sm mt-1">Designer: {r.designer?.name}</p>
                      {r.quotedPrice && <p className="text-gray-600 text-sm font-medium">Quote: {r.quotedPrice.toLocaleString()} RWF</p>}
                      {r.timeline    && <p className="text-gray-500 text-xs">Timeline: {r.timeline}</p>}
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
