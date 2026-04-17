/**
 * Navbar — Phase 4 upgrade
 * Adds: Dark mode toggle, Language switcher, Mobile menu
 * Replace your existing Navbar.jsx with this file
 */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
// import { useAuthStore } from '../store/authStore'; // Uncomment when wired

export default function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mock auth state — replace with your Zustand store
  const user = null; // useAuthStore(s => s.user);
  const logout = () => {}; // useAuthStore(s => s.logout);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    { href: '/rentals',          label: t('nav.rentals') },
    { href: '/real-estate',      label: t('nav.forSale') },
    { href: '/home-services',    label: t('nav.services') },
    { href: '/interior-design',  label: t('nav.interiorDesign') },
  ];

  const isActive = (href) => pathname.startsWith(href);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 500,
          background: scrolled ? 'var(--bg-overlay)' : 'var(--bg-primary)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--border-light)' : 'transparent'}`,
          transition: 'all var(--transition-slow)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: 'var(--brand-primary)',
              letterSpacing: '-0.03em',
            }}>
              🏠 Nyumba<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>.rw</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: '0.25rem', flex: 1 }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.4rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive(link.href) ? 600 : 400,
                  color: isActive(link.href) ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  background: isActive(link.href) ? 'var(--brand-bg)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition)',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginLeft: 'auto', flexShrink: 0 }}>
            {/* Language */}
            <LanguageSwitcher compact />

            {/* Dark mode toggle */}
            <ThemeToggle size="sm" />

            {/* Auth */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  href="/dashboard"
                  style={{
                    padding: '0.4rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-secondary)',
                    transition: 'all var(--transition)',
                  }}
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={logout}
                  style={{
                    padding: '0.4rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                  }}
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  href="/login"
                  style={{
                    padding: '0.4rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    border: '1px solid var(--border-light)',
                    transition: 'all var(--transition)',
                  }}
                >
                  {t('auth.login')}
                </Link>
                <Link
                  href="/register"
                  style={{
                    padding: '0.4rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'white',
                    textDecoration: 'none',
                    background: 'var(--brand-primary)',
                    boxShadow: 'var(--shadow-brand)',
                    transition: 'all var(--transition)',
                  }}
                >
                  {t('auth.register')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              className="mobile-menu-btn"
              style={{
                display: 'none',
                width: '40px',
                height: '40px',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '1.1rem',
              }}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-primary)',
            zIndex: 499,
            padding: '1.5rem',
            overflowY: 'auto',
            animation: 'fadeUp 0.2s ease',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  fontWeight: isActive(link.href) ? 600 : 400,
                  color: isActive(link.href) ? 'var(--brand-primary)' : 'var(--text-primary)',
                  background: isActive(link.href) ? 'var(--brand-bg)' : 'var(--bg-secondary)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Theme</span>
              <ThemeToggle showLabel size="md" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Language</span>
              <LanguageSwitcher />
            </div>
          </div>

          {!user && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <Link href="/login" style={{ flex: 1, padding: '0.875rem', textAlign: 'center', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500 }}>
                {t('auth.login')}
              </Link>
              <Link href="/register" style={{ flex: 1, padding: '0.875rem', textAlign: 'center', background: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'white', fontWeight: 600 }}>
                {t('auth.register')}
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
