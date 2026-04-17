'use client';
import { useState, useEffect } from 'react';
import Link  from 'next/link';
import api   from '@/lib/api';
import toast from 'react-hot-toast';
import AdminStatCard  from '@/components/admin/AdminStatCard';
import BookingsChart  from '@/components/admin/BookingsChart';

export default function AdminOverviewPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await api.get('/api/admin/analytics');
        setData(res);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, charts, recent } = data;

  const statCards = [
    { label: 'Total users',        value: stats.totalUsers,        color: 'blue'  },
    { label: 'Live properties',    value: stats.totalProperties,   color: 'green' },
    { label: 'Total bookings',     value: stats.totalBookings,     color: 'purple'},
    { label: 'Revenue (RWF)',      value: stats.totalRevenue.toLocaleString(), color: 'amber' },
    { label: 'Available now',      value: stats.availableProperties, color: 'green' },
    { label: 'Pending approval',   value: stats.pendingProperties,   color: 'yellow'},
    { label: 'Confirmed bookings', value: stats.confirmedBookings,   color: 'green' },
    { label: 'Cancelled bookings', value: stats.cancelledBookings,   color: 'red'   },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <AdminStatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Pending approval alert */}
      {stats.pendingProperties > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-yellow-500 text-xl">⚠</span>
            <div>
              <p className="font-medium text-yellow-800 text-sm">
                {stats.pendingProperties} propert{stats.pendingProperties === 1 ? 'y' : 'ies'} waiting for approval
              </p>
              <p className="text-yellow-600 text-xs mt-0.5">Review and approve listings before they go live</p>
            </div>
          </div>
          <Link href="/admin/properties?filter=pending" className="text-sm font-medium text-yellow-700 hover:underline">
            Review →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">Bookings — last 6 months</h2>
          <BookingsChart data={charts.bookingsByMonth} />
        </div>

        {/* User roles breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">User roles</h2>
          <div className="space-y-3">
            {charts.userRoles.map(({ _id, count }) => {
              const pct   = Math.round((count / stats.totalUsers) * 100);
              const color = _id === 'admin' ? 'bg-purple-500' : _id === 'owner' ? 'bg-blue-500' : 'bg-green-500';
              return (
                <div key={_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700 font-medium">{_id}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">Recent bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-green-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recent.bookings.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No bookings yet</p>
            )}
            {recent.bookings.map((b) => (
              <div key={b._id} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {b.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{b.property?.title}</p>
                  <p className="text-gray-400 text-xs truncate">{b.user?.name} · {b.user?.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  b.status === 'cancelled' ? 'bg-red-100 text-red-700'    :
                  'bg-yellow-100 text-yellow-700'
                }`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent property submissions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">Recent submissions</h2>
            <Link href="/admin/properties" className="text-xs text-green-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recent.properties.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No submissions yet</p>
            )}
            {recent.properties.map((p) => (
              <div key={p._id} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                  🏠
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-gray-400 text-xs">{p.owner?.name} · {p.location}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  p.isApproved
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {p.isApproved ? 'Live' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
