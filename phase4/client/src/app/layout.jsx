/**
 * Root Layout — Next.js App Router
 * Wires: ThemeProvider + LanguageProvider + PWA
 * Replace your existing app/layout.jsx with this file
 */
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { InstallBanner } from '../hooks/usePWA';
import '../styles/globals.css';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nyumba.rw';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Nyumba.rw — Rwanda's #1 Property Platform",
    template: '%s | Nyumba.rw',
  },
  description: 'Find, rent, and buy properties in Rwanda. Real-time listings, verified landlords, digital contracts, and MTN MoMo payments.',
  keywords: ['Rwanda real estate', 'kigali rentals', 'houses for rent rwanda', 'property kigali', 'inzu rwanda'],
  authors: [{ name: 'Nyumba.rw' }],
  creator: 'Nyumba.rw',
  publisher: 'Nyumba.rw',
  robots: 'index,follow',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2D6A4F' },
    { media: '(prefers-color-scheme: dark)',  color: '#52B788' },
  ],
  openGraph: {
    type: 'website',
    locale: 'en_RW',
    url: BASE_URL,
    siteName: 'Nyumba.rw',
    images: [{ url: `${BASE_URL}/og-default.jpg`, width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@nyumbarw' },
  icons: {
    icon: '/icons/favicon.ico',
    shortcut: '/icons/icon-96x96.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nyumba.rw',
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2D6A4F',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* Dark mode flash prevention */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('nyumba_theme');
                  var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var theme = saved || system;
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <InstallBanner />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
