'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import SearchBar    from '@/components/SearchBar';
import toast        from 'react-hot-toast';

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filters,    setFilters]    = useState({
    district: '', type: '', status: '', minPrice: '', maxPrice: '', search: '',
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const { data } = await api.get('/api/properties', { params });
      setProperties(data.properties);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, [filters]);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Find your home in Rwanda</h1>
        <p className="text-green-100 mb-6">Apartments, houses and rooms — updated in real time</p>
        <SearchBar filters={filters} setFilters={setFilters} />
      </div>

      {/* Stats bar */}
      <div className="flex gap-6 mb-6 text-sm text-gray-500">
        <span>
          <strong className="text-gray-900">{properties.length}</strong> properties found
        </span>
        <span>
          <strong className="text-green-600">
            {properties.filter((p) => p.status === 'available').length}
          </strong> available
        </span>
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="bg-gray-200 h-48 w-full" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🏠</p>
          <p className="text-lg font-medium text-gray-600">No properties found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
