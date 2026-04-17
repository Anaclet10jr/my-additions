'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const DISTRICTS = [
  'Gasabo','Kicukiro','Nyarugenge','Bugesera','Gatsibo',
  'Kayonza','Kirehe','Ngoma','Nyagatare','Rwamagana',
];

export default function ListRealEstatePage() {
  const router  = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages]         = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', listingType: 'sell',
    propertyType: 'house', 'location.address': '', 'location.district': '',
    'features.bedrooms': '', 'features.bathrooms': '', 'features.area': '',
    'features.parking': false, 'features.garden': false, 'features.furnished': false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!user) return router.push('/login');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      // flatten nested keys → mongoose dot-notation
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/real-estate`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ Listing submitted for approval!');
      router.push('/real-estate');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-500 mb-6 flex items-center gap-1 hover:text-gray-800">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800 mb-8">List a Property</h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-5">
          {/* Listing type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
            <div className="flex gap-3">
              {['sell','buy'].map(t => (
                <button key={t} onClick={() => set('listingType', t)}
                  className={`flex-1 py-2.5 rounded-xl border font-medium capitalize transition ${
                    form.listingType === t ? 'border-slate-700 bg-slate-700 text-white' : 'border-gray-200 hover:border-gray-400'
                  }`}>{t === 'sell' ? '💼 For Sale' : '🔍 Looking to Buy'}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500"
              placeholder="e.g. Modern 3-bedroom in Kiyovu" value={form.title}
              onChange={e => set('title', e.target.value)} />
          </div>

          {/* Property type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none"
              value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
              {['house','apartment','land','commercial','villa'].map(t => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (RWF) *</label>
            <input type="number" className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500"
              placeholder="e.g. 85000000" value={form.price} onChange={e => set('price', e.target.value)} />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              <select className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none"
                value={form['location.district']} onChange={e => set('location.district', e.target.value)}>
                <option value="">Select district</option>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500"
                placeholder="Street / neighborhood" value={form['location.address']}
                onChange={e => set('location.address', e.target.value)} />
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            {[['Bedrooms','features.bedrooms'],['Bathrooms','features.bathrooms'],['Area (m²)','features.area']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="number" className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none"
                  value={form[key]} onChange={e => set(key, e.target.value)} />
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="flex gap-4">
              {[['Parking','features.parking'],['Garden','features.garden'],['Furnished','features.furnished']].map(([label, key]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" checked={form[key]}
                    onChange={e => set(key, e.target.checked)} />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea rows={4} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-500 resize-none"
              placeholder="Describe the property in detail..." value={form.description}
              onChange={e => set('description', e.target.value)} />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photos (up to 10)</label>
            <input type="file" accept="image/*" multiple
              className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-500 cursor-pointer"
              onChange={e => setImages(Array.from(e.target.files))} />
            {images.length > 0 && <p className="text-xs text-gray-400 mt-1">{images.length} file(s) selected</p>}
          </div>

          <button onClick={handleSubmit} disabled={submitting || !form.title || !form.price}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit Listing for Approval'}
          </button>
          <p className="text-xs text-gray-400 text-center">Your listing will be reviewed by our team before going live.</p>
        </div>
      </div>
    </div>
  );
}
