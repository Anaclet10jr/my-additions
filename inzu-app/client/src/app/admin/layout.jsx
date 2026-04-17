'use client';
import { useEffect }    from 'react';
import { useRouter }    from 'next/navigation';
import Link             from 'next/link';
import { usePathname }  from 'next/navigation';
import { useAuth }      from '@/context/AuthContext';

const NAV = [
  { href: '/admin',            label: 'Overview',    icon: '▦' },
  { href: '/admin/properties', label: 'Properties',  icon: '🏠' },
  { href: '/admin/bookings',   label: 'Bookings',    icon: '📋' },
  { href: '/admin/users',      label: 'Users',       icon: '👥' },
];

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router            = useRouter();
  const pathname          = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, loading]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen -mx-4 -mt-6">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-700">
          <p className="text-green-400 font-bold text-lg">Inzu</p>
          <p className="text-gray-400 text-xs mt-0.5">Admin dashboard</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-green-600 text-white font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
              <p className="text-gray-500 text-xs">Admin</p>
            </div>
          </div>
          <Link
            href="/"
            className="block text-center text-xs text-gray-400 hover:text-white transition-colors py-1"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
