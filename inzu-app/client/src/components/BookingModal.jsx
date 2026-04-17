'use client';
import { useState } from 'react';
import api   from '@/lib/api';
import toast from 'react-hot-toast';

export default function BookingModal({ property, onClose, onBooked }) {
  const today    = new Date().toISOString().split('T')[0];
  const [form,    setForm]    = useState({ startDate: today, endDate: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Calculate estimated price based on selected dates
  const calcTotal = () => {
    if (!form.startDate || !form.endDate) return null;
    const start  = new Date(form.startDate);
    const end    = new Date(form.endDate);
    const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
    if (months <= 0) return null;
    return property.price * months;
  };

  const total    = calcTotal();
  const set      = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.endDate) return toast.error('Please select a move-out date');
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      return toast.error('End date must be after start date');
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/api/bookings/${property._id}`, form);
      toast.success('Booking confirmed!');
      onBooked({ ...property, status: 'unavailable' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Book this property</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Property summary */}
        <div className="bg-gray-50 rounded-xl p-3 mb-5 flex items-center gap-3">
          <div className="text-2xl">🏠</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate text-sm">{property.title}</p>
            <p className="text-xs text-gray-500 truncate">{property.location}, {property.district}</p>
          </div>
          <p className="text-sm font-bold text-green-600 flex-shrink-0">
            {property.price.toLocaleString()} RWF/mo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Move-in date</label>
              <input
                type="date"
                className="input"
                min={today}
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Move-out date</label>
              <input
                type="date"
                className="input"
                min={form.startDate || today}
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Message to owner (optional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Introduce yourself and ask any questions…"
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
            />
          </div>

          {/* Price estimate */}
          {total !== null && (
            <div className="bg-green-50 rounded-xl p-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>
                  {property.price.toLocaleString()} RWF ×{' '}
                  {Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24 * 30))} month(s)
                </span>
                <span className="font-bold text-green-700">
                  {total.toLocaleString()} RWF
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Estimated total — payment arranged with owner directly
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Booking…' : 'Confirm booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
