'use client';
import { useState, useEffect } from 'react';
import { useRouter }    from 'next/navigation';
import Link             from 'next/link';
import Image            from 'next/image';
import api              from '@/lib/api';
import { useAuth }      from '@/context/AuthContext';
import toast            from 'react-hot-toast';

const statusColors = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100  text-red-700',
};

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }

    const fetch = async () => {
      try {
        const { data } = await api.get('/api/bookings/my');
        setBookings(data.bookings);
      } catch {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, authLoading]);

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/api/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => b._id === id ? { ...b, status: 'cancelled' } : b)
      );
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-4 animate-pulse flex gap-4">
            <div className="w-24 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg font-medium text-gray-700">No bookings yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Browse available properties and book your next home
          </p>
          <Link href="/" className="btn-primary inline-block">
            Browse properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const prop  = booking.property;
            const start = new Date(booking.startDate).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' });
            const end   = new Date(booking.endDate).toLocaleDateString('en-RW',   { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <div key={booking._id} className="card p-4 flex gap-4">
                {/* Property thumbnail */}
                <Link href={`/property/${prop?._id}`} className="flex-shrink-0">
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-gray-100">
                    {prop?.images?.[0] ? (
                      <Image src={prop.images[0]} alt={prop.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/property/${prop?._id}`}
                      className="font-semibold text-gray-900 hover:text-green-600 transition-colors truncate text-sm">
                      {prop?.title || 'Property unavailable'}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 capitalize ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    📍 {prop?.location}, {prop?.district}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-gray-500">
                    <span>📅 {start} → {end}</span>
                    <span>💰 {booking.totalPrice?.toLocaleString()} RWF total</span>
                  </div>

                  {booking.message && (
                    <p className="text-xs text-gray-400 mt-1 italic truncate">
                      "{booking.message}"
                    </p>
                  )}
                </div>

                {/* Cancel button */}
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    className="flex-shrink-0 self-center text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
