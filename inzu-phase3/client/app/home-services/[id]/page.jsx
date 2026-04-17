'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function ServiceDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { user } = useAuth();
  const [service,   setService]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);
  const [form, setForm] = useState({
    description: '', address: '', district: '', preferredDate: '', preferredTime: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`);
        setService(data);
      } catch { router.push('/home-services'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const submitRequest = async () => {
    if (!user) return router.push('/login');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}/request`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDone(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally { setSubmitting(false); }
  };

  const renderStars = avg => '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
    </div>
  );
  if (!service) return null;

  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => router.back()} className="text-sm text-gray-500 mb-6 flex items-center gap-1 hover:text-gray-800">
          ← Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
              {(service.coverImage || service.images?.[0]) && (
                <img
                  src={service.coverImage || service.images[0]}
                  alt={service.name}
                  className="w-full h-56 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{service.name}</h1>
                    <p className="text-gray-400 text-sm capitalize mt-0.5">{service.category.replace('_',' ')}</p>
                  </div>
                  {service.isVerified && (
                    <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">✓ Verified</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-amber-400">{renderStars(service.rating?.average || 0)}</span>
                  <span className="text-gray-500 text-sm">{service.rating?.average?.toFixed(1) || '0.0'} ({service.rating?.count || 0} reviews)</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500 text-sm">{service.totalJobs} jobs done</span>
                </div>

                <p className="text-gray-600 leading-relaxed">{service.description}</p>

                {/* Pricing */}
                <div className="mt-5 p-4 bg-orange-50 rounded-xl">
                  <p className="text-sm text-orange-700 font-medium">Pricing</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {service.priceModel === 'fixed'  && `${service.basePrice?.toLocaleString()} RWF`}
                    {service.priceModel === 'hourly' && `${service.basePrice?.toLocaleString()} RWF / hour`}
                    {service.priceModel === 'quote'  && 'Free quote on request'}
                  </p>
                </div>

                {/* Availability */}
                <div className="mt-5">
                  <p className="font-medium text-gray-700 mb-2">Available Days</p>
                  <div className="flex gap-2">
                    {DAYS.map(d => (
                      <span key={d} className={`text-xs px-2 py-1 rounded ${
                        service.availability?.days?.includes(d)
                          ? 'bg-green-100 text-green-700 font-medium'
                          : 'bg-gray-100 text-gray-400'
                      }`}>{d}</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Hours: {service.availability?.startTime} – {service.availability?.endTime}
                  </p>
                </div>

                {/* Service area */}
                {service.serviceArea?.length > 0 && (
                  <div className="mt-5">
                    <p className="font-medium text-gray-700 mb-2">Service Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {service.serviceArea.map(a => (
                        <span key={a} className="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {service.portfolio?.length > 0 && (
                  <div className="mt-6">
                    <p className="font-medium text-gray-700 mb-3">Previous Work</p>
                    <div className="grid grid-cols-3 gap-2">
                      {service.portfolio.map((img, i) => (
                        <img key={i} src={img} alt="" className="rounded-lg h-24 w-full object-cover" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: provider + CTA */}
          <div className="space-y-5">
            {/* Provider */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Service Provider</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xl font-bold text-gray-600">
                  {service.provider?.avatar
                    ? <img src={service.provider.avatar} className="w-full h-full object-cover" />
                    : service.provider?.name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{service.provider?.name}</p>
                </div>
              </div>
              <a
                href={`https://wa.me/250${service.provider?.phone?.replace(/^0/,'')}?text=Hi, I need your service: ${service.name}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition w-full"
              >
                💬 WhatsApp
              </a>
            </div>

            {/* Book CTA */}
            <div className="bg-orange-500 rounded-2xl p-6 text-white shadow-sm">
              {done ? (
                <div className="text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-semibold">Request Submitted!</p>
                  <p className="text-orange-100 text-sm mt-1">The provider will contact you soon.</p>
                </div>
              ) : showForm ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Book this Service</h3>
                  <textarea
                    rows={3}
                    placeholder="Describe the work needed..."
                    className="w-full rounded-xl px-4 py-3 text-gray-800 text-sm resize-none focus:outline-none"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Your address"
                    className="w-full rounded-xl px-4 py-3 text-gray-800 text-sm"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="w-full rounded-xl px-4 py-3 text-gray-800 text-sm"
                    value={form.preferredDate}
                    onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-orange-400 hover:bg-orange-300 py-3 rounded-xl text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitRequest}
                      disabled={submitting || !form.description}
                      className="flex-1 bg-white text-orange-600 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                    >
                      {submitting ? 'Sending…' : 'Submit'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-semibold text-xl mb-1">Need this service?</p>
                  <p className="text-orange-100 text-sm mb-5">Get a free quote within 24 hours</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl w-full hover:bg-orange-50 transition"
                  >
                    Request This Service
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
