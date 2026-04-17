'use client';
import { useState }     from 'react';
import { useRouter }    from 'next/navigation';
import { useAuth }      from '@/context/AuthContext';
import api              from '@/lib/api';
import toast            from 'react-hot-toast';

const DISTRICTS  = ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Other'];
const TYPES      = ['apartment', 'house', 'room', 'office'];
const AMENITIES  = ['wifi', 'parking', 'security', 'water', 'electricity', 'furnished', 'balcony'];

export default function ListPropertyPage() {
  const router    = useRouter();
  const { user }  = useAuth();

  const [form, setForm] = useState({
    title: '', description: '', price: '', location: '',
    district: 'Gasabo', type: 'apartment',
    bedrooms: '1', bathrooms: '1',
    amenities: [],
  });
  const [images,   setImages]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading,  setLoading]  = useState(false);

  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🔒</p>
        <p className="text-lg font-medium text-gray-700">Owners only</p>
        <p className="text-sm text-gray-500 mt-1">
          Register as a property owner to list here
        </p>
      </div>
    );
  }

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const toggleAmenity = (a) => {
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a)
        ? p.amenities.filter((x) => x !== a)
        : [...p.amenities, a],
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 8);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.location || !form.description) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') fd.append(k, v.join(','));
        else fd.append(k, v);
      });
      images.forEach((img) => fd.append('images', img));

      await api.post('/api/properties', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Property submitted! It will go live after admin approval.');
      router.push('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">List a property</h1>
        <p className="text-gray-500 text-sm mt-1">
          Your listing will be reviewed and approved before it goes live.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic information</h2>

          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input
              className="input" placeholder="e.g. Modern 2-bedroom in Kimihurura"
              value={form.title} onChange={(e) => set('title', e.target.value)} required
            />
          </div>

          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea
              className="input resize-none" rows={4}
              placeholder="Describe the property — size, condition, nearby landmarks…"
              value={form.description} onChange={(e) => set('description', e.target.value)} required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Monthly rent (RWF) <span className="text-red-500">*</span></label>
              <input
                type="number" className="input" placeholder="e.g. 300000"
                value={form.price} onChange={(e) => set('price', e.target.value)}
                min="0" required
              />
            </div>
            <div>
              <label className="label">Property type</label>
              <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Location</h2>

          <div>
            <label className="label">Address / landmark <span className="text-red-500">*</span></label>
            <input
              className="input"
              placeholder="e.g. KG 11 Ave, near Kigali Heights"
              value={form.location} onChange={(e) => set('location', e.target.value)} required
            />
          </div>

          <div>
            <label className="label">District</label>
            <select className="input" value={form.district} onChange={(e) => set('district', e.target.value)}>
              {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Details */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Property details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Bedrooms</label>
              <input
                type="number" className="input" min="1" max="20"
                value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Bathrooms</label>
              <input
                type="number" className="input" min="1" max="20"
                value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Amenities</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {AMENITIES.map((a) => (
                <button
                  type="button" key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors capitalize ${
                    form.amenities.includes(a)
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Photos</h2>
          <p className="text-sm text-gray-500 -mt-2">Up to 8 photos. Good photos get booked faster.</p>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-green-400 transition-colors">
            <span className="text-3xl mb-2">📷</span>
            <span className="text-sm font-medium text-gray-700">Click to upload photos</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG or WebP — max 5 MB each</span>
            <input
              type="file" multiple accept="image/*" className="hidden"
              onChange={handleImages}
            />
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? 'Submitting…' : 'Submit listing'}
        </button>
      </form>
    </div>
  );
}
