'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function PropertyDetailPage() {
  const { id }     = useParams();
  const router     = useRouter();
  const { user }   = useAuth();
  const [property, setProperty]    = useState(null);
  const [loading,  setLoading]     = useState(true);
  const [imgIdx,   setImgIdx]      = useState(0);
  const [inquiry,  setInquiry]     = useState({ message: '', phone: '' });
  const [sending,  setSending]     = useState(false);
  const [sent,     setSent]        = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/real-estate/${id}`);
        setProperty(data);
      } catch { router.push('/real-estate'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const sendInquiry = async () => {
    if (!user) return router.push('/login');
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/real-estate/${id}/inquiry`,
        inquiry,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send inquiry');
    } finally { setSending(false); }
  };

  const formatPrice = n => new Intl.NumberFormat('rw').format(n);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700" />
    </div>
  );
  if (!property) return null;

  const { features, location, owner } = property;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back */}
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1">
          ← Back to listings
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: images + details */}
          <div className="lg:col-span-2">
            {/* Image gallery */}
            <div className="relative rounded-2xl overflow-hidden h-80 bg-gray-200 mb-3">
              <img
                src={property.images?.[imgIdx] || '/placeholder-property.jpg'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 right-4 bg-white/90 text-gray-700 text-xs px-3 py-1 rounded-full">
                {imgIdx + 1} / {property.images?.length || 1}
              </span>
            </div>
            {property.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {property.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}>
                    <img
                      src={img}
                      className={`h-16 w-24 object-cover rounded-lg flex-shrink-0 border-2 transition ${
                        i === imgIdx ? 'border-slate-700' : 'border-transparent'
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Title & location */}
            <div className="mt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{property.title}</h1>
                  <p className="text-gray-500 mt-1">📍 {location?.address}, {location?.district}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">{formatPrice(property.price)}</p>
                  <p className="text-gray-400 text-sm">RWF</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {features?.bedrooms > 0 && (
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl mb-1">🛏</div>
                  <div className="font-semibold">{features.bedrooms}</div>
                  <div className="text-gray-400 text-xs">Bedrooms</div>
                </div>
              )}
              {features?.bathrooms > 0 && (
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl mb-1">🚿</div>
                  <div className="font-semibold">{features.bathrooms}</div>
                  <div className="text-gray-400 text-xs">Bathrooms</div>
                </div>
              )}
              {features?.area && (
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl mb-1">📐</div>
                  <div className="font-semibold">{features.area}</div>
                  <div className="text-gray-400 text-xs">m²</div>
                </div>
              )}
              {features?.floors > 1 && (
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl mb-1">🏢</div>
                  <div className="font-semibold">{features.floors}</div>
                  <div className="text-gray-400 text-xs">Floors</div>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mt-4">
              {features?.parking  && <span className="bg-slate-100 px-3 py-1.5 rounded-full text-sm">🚗 Parking</span>}
              {features?.garden   && <span className="bg-slate-100 px-3 py-1.5 rounded-full text-sm">🌿 Garden</span>}
              {features?.furnished && <span className="bg-slate-100 px-3 py-1.5 rounded-full text-sm">🛋 Furnished</span>}
              {features?.yearBuilt && <span className="bg-slate-100 px-3 py-1.5 rounded-full text-sm">📅 Built {features.yearBuilt}</span>}
            </div>

            {/* Description */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          </div>

          {/* Right: contact + owner */}
          <div className="space-y-6">
            {/* Owner card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Listed by</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xl font-bold text-slate-600">
                  {owner?.avatar
                    ? <img src={owner.avatar} className="w-full h-full object-cover" />
                    : owner?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{owner?.name}</p>
                  <p className="text-gray-400 text-xs">Owner</p>
                </div>
              </div>
              <a
                href={`https://wa.me/250${owner?.phone?.replace(/^0/, '')}?text=Hi, I'm interested in your property: ${property.title}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition w-full"
              >
                <span>💬</span> WhatsApp
              </a>
              <a
                href={`tel:${owner?.phone}`}
                className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition w-full mt-3"
              >
                📞 Call
              </a>
            </div>

            {/* Inquiry form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Send an Inquiry</h3>
              {sent ? (
                <div className="text-center py-4 text-green-600">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="font-medium">Inquiry sent!</p>
                  <p className="text-sm text-gray-400 mt-1">The owner will contact you soon.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500"
                    value={inquiry.phone}
                    onChange={e => setInquiry(i => ({ ...i, phone: e.target.value }))}
                  />
                  <textarea
                    rows={4}
                    placeholder="I'm interested in this property..."
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500 resize-none"
                    value={inquiry.message}
                    onChange={e => setInquiry(i => ({ ...i, message: e.target.value }))}
                  />
                  <button
                    onClick={sendInquiry}
                    disabled={sending || !inquiry.message}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {sending ? 'Sending…' : 'Send Inquiry'}
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-slate-50 rounded-2xl p-4 text-sm text-gray-500 flex gap-4">
              <span>👁 {property.views} views</span>
              <span>📋 {property.inquiries?.length || 0} inquiries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
