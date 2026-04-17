'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';

const SECTIONS = [
  {
    href:    '/properties',
    label:   'Rentals',
    icon:    '🏠',
    desc:    'Find apartments & houses for rent',
    color:   'from-blue-600 to-blue-500',
    badge:   null,
  },
  {
    href:    '/real-estate',
    label:   'Buy / Sell',
    icon:    '🏢',
    desc:    'Real estate listings across Rwanda',
    color:   'from-slate-700 to-slate-600',
    badge:   'New',
  },
  {
    href:    '/home-services',
    label:   'Home Services',
    icon:    '🔧',
    desc:    'Trusted repair & maintenance pros',
    color:   'from-orange-500 to-amber-500',
    badge:   'New',
  },
  {
    href:    '/interior-design',
    label:   'Interior Design',
    icon:    '🛋',
    desc:    'Transform your space with local designers',
    color:   'from-stone-700 to-amber-700',
    badge:   'New',
  },
];

export default function HomePage() {
  const [featuredRentals,   setFeaturedRentals]   = useState([]);
  const [featuredRealEstate,setFeaturedRealEstate] = useState([]);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    axios.get(`${API}/api/properties?limit=3&sort=newest`).then(r => setFeaturedRentals(r.data.properties || [])).catch(()=>{});
    axios.get(`${API}/api/real-estate?limit=3&sort=featured`).then(r => setFeaturedRealEstate(r.data.listings || [])).catch(()=>{});
  }, []);

  const formatPrice = n => new Intl.NumberFormat('rw').format(n);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Inzu<span className="text-blue-200"> — Your Home,</span><br/>Your City
          </h1>
          <p className="text-blue-100 text-lg mb-10">
            Rwanda's all-in-one platform for rentals, real estate, home repair, and interior design.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {SECTIONS.map(s => (
              <Link
                key={s.href}
                href={s.href}
                className={`bg-gradient-to-r ${s.color} hover:opacity-90 text-white px-6 py-3 rounded-full font-semibold transition flex items-center gap-2 shadow-lg`}
              >
                {s.icon} {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section cards */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">What are you looking for?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SECTIONS.map(s => (
            <Link key={s.href} href={s.href}>
              <div className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-6 h-40 flex flex-col justify-between hover:scale-105 transition-transform duration-200 shadow-md relative overflow-hidden`}>
                {s.badge && (
                  <span className="absolute top-3 right-3 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {s.badge}
                  </span>
                )}
                <span className="text-4xl">{s.icon}</span>
                <div>
                  <p className="font-bold text-lg">{s.label}</p>
                  <p className="text-white/70 text-sm">{s.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured rentals */}
      {featuredRentals.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🏠 Latest Rentals</h2>
            <Link href="/properties" className="text-blue-600 hover:underline text-sm">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredRentals.map(p => (
              <Link key={p._id} href={`/properties/${p._id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition group">
                  <div className="h-44 overflow-hidden">
                    <img src={p.images?.[0] || '/placeholder.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">{p.title}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">{p.location}</p>
                    <p className="font-bold text-blue-700 mt-2">{formatPrice(p.price)} RWF/mo</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured real estate */}
      {featuredRealEstate.length > 0 && (
        <section className="bg-slate-800 py-14">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">🏢 Properties for Sale</h2>
              <Link href="/real-estate" className="text-slate-300 hover:underline text-sm">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {featuredRealEstate.map(p => (
                <Link key={p._id} href={`/real-estate/${p._id}`}>
                  <div className="bg-slate-700 rounded-2xl overflow-hidden hover:bg-slate-600 transition group">
                    <div className="h-44 overflow-hidden">
                      <img src={p.images?.[0] || '/placeholder.jpg'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white line-clamp-1">{p.title}</h3>
                      <p className="text-slate-400 text-sm mt-0.5">{p.location?.district}</p>
                      <p className="font-bold text-slate-200 mt-2">{formatPrice(p.price)} RWF</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA: List your property */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl p-10 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Are you a provider or property owner?</h2>
            <p className="text-orange-100">List your property, service, or design portfolio for free.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/properties/list"     className="bg-white text-orange-600 font-bold px-6 py-3 rounded-full hover:bg-orange-50 transition text-sm">List Rental</Link>
            <Link href="/real-estate/list"    className="bg-white text-orange-600 font-bold px-6 py-3 rounded-full hover:bg-orange-50 transition text-sm">List Property</Link>
            <Link href="/home-services/list"  className="bg-white text-orange-600 font-bold px-6 py-3 rounded-full hover:bg-orange-50 transition text-sm">List Service</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
