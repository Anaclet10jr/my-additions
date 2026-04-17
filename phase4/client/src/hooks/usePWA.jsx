/**
 * usePWA — Register service worker + handle install prompt
 * Call in _app.jsx or RootLayout
 */
import { useEffect, useState } from 'react';

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
          setSwRegistered(true);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New version available. Refresh to update.');
                // Could show a toast here
              }
            });
          });
        })
        .catch((err) => console.error('[PWA] SW registration failed:', err));
    }

    // Capture install prompt (Chrome/Edge)
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  return { canInstall: !!installPrompt && !isInstalled, isInstalled, promptInstall, swRegistered };
}

// ─── Install banner component ─────────────────────────────
export function InstallBanner() {
  const { canInstall, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '1rem 1.25rem',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 9999,
        maxWidth: '420px',
        width: 'calc(100% - 2rem)',
        animation: 'fadeUp 0.3s ease',
      }}
    >
      <span style={{ fontSize: '2rem' }}>🏠</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
          Install Nyumba.rw
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Get the app for faster access and offline browsing
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={() => setDismissed(true)}
          style={{
            padding: '0.4rem 0.75rem',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          Later
        </button>
        <button
          onClick={promptInstall}
          style={{
            padding: '0.4rem 0.875rem',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: 'var(--brand-primary)',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
}
