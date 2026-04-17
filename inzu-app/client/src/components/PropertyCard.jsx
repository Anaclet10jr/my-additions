'use client';
import { useState, useEffect } from 'react';
import Image        from 'next/image';
import Link         from 'next/link';
import { useSocket } from '@/context/SocketContext';
import StatusBadge   from './StatusBadge';

export default function PropertyCard({ property }) {
  const socket            = useSocket();
  const [status, setStatus] = useState(property.status);

  // Listen for real-time booking updates for this specific property
  useEffect(() => {
    if (!socket) return;

    socket.on('property_booked', ({ propertyId }) => {
      if (propertyId === property._id) setStatus('unavailable');
    });

    socket.on('property_available', ({ propertyId }) => {
      if (propertyId === property._id) setStatus('available');
    });

    return () => {
      socket.off('property_booked');
      socket.off('property_available');
    };
  }, [socket, property._id]);

  return (
    <Link href={`/property/${property._id}`} className="card group hover:shadow-md transition-shadow duration-200 block">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">
            🏠
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} />
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full capitalize">
            {property.type}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
        <p className="text-sm text-gray-500 mt-0.5 truncate">
          📍 {property.location}, {property.district}
        </p>

        <div className="flex gap-3 text-xs text-gray-400 mt-2">
          <span>🛏 {property.bedrooms} bed</span>
          <span>🚿 {property.bathrooms} bath</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <p className="font-bold text-gray-900">
            {property.price.toLocaleString()}
            <span className="text-xs font-normal text-gray-400"> RWF/mo</span>
          </p>
          <span className="text-xs text-green-600 font-medium group-hover:underline">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
