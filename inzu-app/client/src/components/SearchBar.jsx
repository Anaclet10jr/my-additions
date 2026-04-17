'use client';

const DISTRICTS = ['Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Other'];
const TYPES     = ['apartment', 'house', 'room', 'office'];

export default function SearchBar({ filters, setFilters }) {
  const set = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-3">
      {/* Keyword search */}
      <input
        type="text"
        className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
        placeholder="Search by title, location or description…"
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
      />

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        <select
          className="bg-white/20 text-white placeholder-white/70 text-sm px-3 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-1 focus:ring-white"
          value={filters.district}
          onChange={(e) => set('district', e.target.value)}
        >
          <option value="">All districts</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          className="bg-white/20 text-white text-sm px-3 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-1 focus:ring-white"
          value={filters.type}
          onChange={(e) => set('type', e.target.value)}
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t} className="text-gray-900 capitalize">{t}</option>
          ))}
        </select>

        <select
          className="bg-white/20 text-white text-sm px-3 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-1 focus:ring-white"
          value={filters.status}
          onChange={(e) => set('status', e.target.value)}
        >
          <option value="">Any status</option>
          <option value="available"   className="text-gray-900">Available only</option>
          <option value="unavailable" className="text-gray-900">Booked</option>
        </select>

        <input
          type="number"
          className="bg-white/20 text-white text-sm px-3 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-1 focus:ring-white w-32 placeholder-white/70"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={(e) => set('minPrice', e.target.value)}
        />

        <input
          type="number"
          className="bg-white/20 text-white text-sm px-3 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-1 focus:ring-white w-32 placeholder-white/70"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={(e) => set('maxPrice', e.target.value)}
        />

        {Object.values(filters).some((v) => v !== '') && (
          <button
            onClick={() => setFilters({ district: '', type: '', status: '', minPrice: '', maxPrice: '', search: '' })}
            className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-2 rounded-lg border border-white/30 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
