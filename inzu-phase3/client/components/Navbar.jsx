'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { href: '/properties',     label: 'Rentals',        icon: '🏠' },
  { href: '/real-estate',    label: 'Buy / Sell',      icon: '🏢' },
  { href: '/home-services',  label: 'Home Services',   icon: '🔧' },
  { href: '/interior-design',label: 'Interior Design', icon: '🛋' },
];

export default function Navbar() {
  const pathname     = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-blue-700">
          <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">I</span>
          Inzu
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname.startsWith(href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin"
                  className="relative text-gray-500 hover:text-gray-800 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                  Admin
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
                </Link>
              )}
              <Link href="/dashboard/client" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50">
                My Dashboard
              </Link>
              <button onClick={logout}
                className="text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50">Sign In</Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(o => !o)}>
          <span className="text-xl">{menuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {NAV_LINKS.map(({ href, label, icon }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname.startsWith(href) ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {icon} {label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3 mt-3">
            {user ? (
              <>
                <Link href="/dashboard/client" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">My Dashboard</Link>
                {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Admin Panel</Link>}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login"    onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Sign In</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
