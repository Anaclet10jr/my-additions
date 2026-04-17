'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image        from 'next/image';
import api          from '@/lib/api';
import { useAuth }  from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import BookingModal  from '@/components/BookingModal';
import StatusBadge   from '@/components/StatusBadge';
import toast         from 'react-hot-toast';

export default function PropertyPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const { user }  = useAuth();
  const socket    = useSocket();

  const [property,      setProperty]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [activeImage,   setActiveImage]   = useState(0);
  const [showBooking,   setShowBooking]   = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/api/properties/${id}`);
        setProperty(data.property);
      } catch {
        toast.error('Property not found');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Join this property's Socket.IO room for targeted real-time updates
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_property', id);

    socket.on('property_booked', ({ propertyId }) => {
      if (propertyId === id) {
        setProperty((prev) => prev ? { ...prev, status: 'unavailable' } : prev);
        toast.error('This property was just booked by someone else!');
      }
    });

    socket.on('property_available', ({ propertyId }) => {
      if (propertyId === id) {
        setProperty((prev) => prev ? { ...prev, status: 'available' } : prev);
        toast.success('This property is available again!');
      }
    });

    return () => {
      socket.emit('leave_property', id);
      socket.off('property_booked');
      socket.off('property_available');
    };
  }, [socket, id]);

  if (loading) return (
    <div className="animate-pulse max-w-4xl mx-auto">
      <div className="bg-gray-200 rounded-2xl h-80 mb-6" />
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  );

  if (!property) return null;

  const amenityIcons = {
    wifi: '📶', parking: '🅿️', security: '🔒', water: '💧',
    electricity: '⚡', furnished: '🛋️', balcony: '🏗️',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Image gallery */}
      <div className="mb-6">
        {property.images?.length > 0 ? (
          <>
            <div className="relative w-full h-80 rounded-2xl overflow-hidden mb-3">
              <Image
                src={property.images[activeImage]}
                alt={property.title}
                fill
                className="object-cover"
              />
            </div>
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage ? 'border-green-500' : 'border-transparent'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-80 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
            <span className="text-6xl">🏠</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-gray-500 mt-1">📍 {property.location}, {property.district}</p>
            </div>
            <StatusBadge status={property.status} />
          </div>

          <div className="flex gap-4 text-sm text-gray-600">
            <span>🛏 {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}</span>
            <span>🚿 {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}</span>
            <span className="capitalize">🏠 {property.type}</span>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>

          {property.amenities?.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full">
                    {amenityIcons[a] || '✓'} {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Owner info */}
          {property.owner && (
            <div className="border-t pt-4">
              <h2 className="font-semibold text-gray-900 mb-2">Listed by</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-sm">
                  {property.owner.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{property.owner.name}</p>
                  <p className="text-sm text-gray-500">{property.owner.phone || property.owner.email}</p>
                </div>
                {property.owner.phone && (
                  <a
                    href={`https://wa.me/${property.owner.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-sm bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Booking card */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-6">
            <p className="text-3xl font-bold text-gray-900">
              {property.price.toLocaleString()}
              <span className="text-base font-normal text-gray-400"> RWF/mo</span>
            </p>

            <div className="my-4 py-4 border-y border-gray-100 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Type</span>
                <span className="font-medium capitalize">{property.type}</span>
              </div>
              <div className="flex justify-between">
                <span>District</span>
                <span className="font-medium">{property.district}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <StatusBadge status={property.status} small />
              </div>
            </div>

            {property.status === 'available' ? (
              user ? (
                <button
                  onClick={() => setShowBooking(true)}
                  className="btn-primary w-full"
                >
                  Book this property
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/login')}
                  className="btn-primary w-full"
                >
                  Login to book
                </button>
              )
            ) : (
              <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
                Already booked
              </button>
            )}

            <p className="text-xs text-gray-400 text-center mt-3">
              No payment required to reserve — owner will contact you
            </p>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {showBooking && (
        <BookingModal
          property={property}
          onClose={() => setShowBooking(false)}
          onBooked={(updatedProperty) => {
            setProperty(updatedProperty);
            setShowBooking(false);
          }}
        />
      )}
    </div>
  );
}
