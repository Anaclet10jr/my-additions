'use client';
import Link          from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth }   from '@/context/AuthContext';
import toast         from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router           = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-green-600">
          Inzu
          <span className="text-xs font-normal text-gray-400 ml-1">Rwanda</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/"             className="hover:text-green-600 transition-colors">Rentals</Link>
          <Link href="/my-bookings"  className="hover:text-green-600 transition-colors">My bookings</Link>
          {user?.role === 'owner' || user?.role === 'admin' ? (
            <Link href="/list-property" className="hover:text-green-600 transition-colors">
              List a property
            </Link>
          ) : null}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-gray-600">
                {user.name.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login"    className="btn-secondary text-sm py-2 px-4">Log in</Link>
              <Link href="/auth/register" className="btn-primary  text-sm py-2 px-4">Register</Link>
            </>
          )}

          {/* Hidden admin access button */}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="w-2 h-2 rounded-full bg-gray-300 hover:bg-green-500 transition-colors"
              title="Admin dashboard"
            />
          )}
        </div>
      </div>
    </nav>
  );
}
