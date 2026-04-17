'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = [
  'plumbing','electrical','painting','roofing','tiling',
  'carpentry','masonry','cleaning','landscaping','renovation',
  'hvac','solar','security','pest_control','interior_fit_out',
];

const DISTRICTS = ['Gasabo','Kicukiro','Nyarugenge','Bugesera','Kayonza','Kirehe','Ngoma','Nyagatare','Rwamagana'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function ListServicePage() {
  const router   = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages]         = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', category: '', priceModel: 'quote', basePrice: '',
    'availability.startTime': '08:00', 'availability.endTime': '18:00',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleDay  = d => setSelectedDays(days  => days.includes(d)  ? days.filter(x=>x!==d)  : [...days, d]);
  const toggleArea = a => setSelectedAreas(areas => areas.includes(a) ? areas.filter(x=>x!==a) : [...areas, a]);

  const handleSubmit = async () => {
    if (!user) return router.push('/login');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      selectedDays.forEach(d  => fd.append('availability.days', d));
      selectedAreas.forEach(a => fd.append('serviceArea', a));
      images.forEach(img => fd.append('images', img));
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ Service listed! Pending admin approval.');
      router.push('/home-services');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-500 mb-6 flex items-center gap-1 hover:text-gray-800">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800 mb-8">List Your Service</h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
            <input className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"
              placeholder="e.g. Professional Plumbing & Pipe Repair"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none"
              value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="capitalize">{c.replace('_',' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea rows={4} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
              placeholder="Describe your service, experience, and what makes you stand out..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Model</label>
            <div className="flex gap-2">
              {['fixed','hourly','quote'].map(m => (
                <button key={m} onClick={() => set('priceModel', m)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition ${
                    form.priceModel === m ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200'
                  }`}>{m}</button>
              ))}
            </div>
            {form.priceModel !== 'quote' && (
              <input type="number" className="w-full border rounded-xl px-4 py-3 text-sm mt-3 focus:outline-none"
                placeholder={`Price in RWF${form.priceModel === 'hourly' ? ' per hour' : ''}`}
                value={form.basePrice} onChange={e => set('basePrice', e.target.value)} />
            )}
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map(d => (
                <button key={d} onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedDays.includes(d) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>{d}</button>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Start time</label>
                <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form['availability.startTime']} onChange={e => set('availability.startTime', e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">End time</label>
                <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={form['availability.endTime']} onChange={e => set('availability.endTime', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Service areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas (districts)</label>
            <div className="flex gap-2 flex-wrap">
              {DISTRICTS.map(d => (
                <button key={d} onClick={() => toggleArea(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedAreas.includes(d) ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>{d}</button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Work Photos</label>
            <input type="file" accept="image/*" multiple
              className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-500 cursor-pointer"
              onChange={e => setImages(Array.from(e.target.files))} />
            {images.length > 0 && <p className="text-xs text-gray-400 mt-1">{images.length} file(s) selected</p>}
          </div>

          <button onClick={handleSubmit} disabled={submitting || !form.name || !form.category}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit Service for Approval'}
          </button>
          <p className="text-xs text-gray-400 text-center">Your listing will be reviewed before going live.</p>
        </div>
      </div>
    </div>
  );
}
