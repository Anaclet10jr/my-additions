import './globals.css';
import { AuthProvider }   from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { Toaster }        from 'react-hot-toast';
import Navbar             from '@/components/Navbar';

export const metadata = {
  title:       'Inzu — Rwanda Rentals & Real Estate',
  description: 'Find apartments, houses and rooms to rent across Rwanda',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <SocketProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-6">
              {children}
            </main>
            <Toaster position="top-right" />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
