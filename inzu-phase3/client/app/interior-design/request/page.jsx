'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const ROOM_TYPES = ['living_room','bedroom','kitchen','bathroom','office','dining_room','outdoor','full_home','commercial'];
const STYLES     = ['modern','contemporary','traditional','minimalist','rustic','industrial','scandinavian','bohemian','african_fusion','luxury'];
const PROJECT_TYPES = ['consultation','full_design','3d_render','furniture_sourcing','supervision'];
const styleLabel = s => s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function DesignRequestPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user }     = useAuth();
  const designerId   = searchParams.get('designer');
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]               = useState(false);
  const [images, setImages]           = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [form, setForm] = useState({
    projectType: 'consultation', style: '', description: '',
    'budget.min': '', 'budget.max': '', address: '', district: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleRoom = r => setSelectedRooms(rooms => rooms.includes(r) ? rooms.filter(x=>x!==r) : [...rooms, r]);

  const handleSubmit = async () => {
    if (!user) return router.push('/login');
    if (!designerId) { alert('No designer selected.'); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      selectedRooms.forEach(r => fd.append('roomType', r));
      images.forEach(img => fd.append('referenceImages', img));
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/interior/${designerId}/request`, fd,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setDone(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  if (done) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Sent!</h2>
        <p className="text-gray-500 mb-6">The designer will review your brief and get back to you with a quote.</p>
        <button onClick={() => router.push('/interior-design')}
          className="bg-stone-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-stone-700 transition">
          Back to Interior Design
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-500 mb-6 flex items-center gap-1 hover:text-gray-800">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Request Design Work</h1>
        <p className="text-gray-400 mb-8 text-sm">Fill in your brief — the designer will respond with a quote within 24 hours.</p>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          {/* Project type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_TYPES.map(t => (
                <button key={t} onClick={() => set('projectType', t)}
                  className={`py-2.5 px-3 rounded-xl border text-sm text-left font-medium capitalize transition ${
                    form.projectType === t ? 'border-stone-700 bg-stone-700 text-white' : 'border-gray-200 hover:border-gray-400'
                  }`}>{styleLabel(t)}</button>
              ))}
            </div>
          </div>

          {/* Room types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type(s)</label>
            <div className="flex flex-wrap gap-2">
              {ROOM_TYPES.map(r => (
                <button key={r} onClick={() => toggleRoom(r)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedRooms.includes(r) ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>{styleLabel(r)}</button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Style</label>
            <select className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none"
              value={form.style} onChange={e => set('style', e.target.value)}>
              <option value="">Not sure / Open to suggestions</option>
              {STYLES.map(s => <option key={s} value={s}>{styleLabel(s)}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Brief *</label>
            <textarea rows={5} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-500 resize-none"
              placeholder="Describe your vision, current state of the space, what you want to change, any specific requirements..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (RWF)</label>
            <div className="flex gap-3">
              <input type="number" className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="Minimum" value={form['budget.min']} onChange={e => set('budget.min', e.target.value)} />
              <input type="number" className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="Maximum" value={form['budget.max']} onChange={e => set('budget.max', e.target.value)} />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Location</label>
            <input className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none mb-2"
              placeholder="Address / neighborhood" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>

          {/* Reference images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Images (inspiration)</label>
            <input type="file" accept="image/*" multiple
              className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-sm text-gray-500 cursor-pointer"
              onChange={e => setImages(Array.from(e.target.files))} />
            {images.length > 0 && <p className="text-xs text-gray-400 mt-1">{images.length} file(s) selected</p>}
          </div>

          <button onClick={handleSubmit} disabled={submitting || !form.description || !form.projectType}
            className="w-full bg-stone-800 hover:bg-stone-700 text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-50">
            {submitting ? 'Sending Request…' : 'Send Design Brief'}
          </button>
        </div>
      </div>
    </div>
  );
}
