/**
 * /offline — Shown by service worker when user is offline
 * and no cached version of the requested page exists
 */
export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'grayscale(0.3)' }}>📶</div>
      <h1
        style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          color: 'var(--text-primary)',
          marginBottom: '1rem',
        }}
      >
        You're offline
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.7, marginBottom: '2rem' }}>
        No internet connection. Please check your network and try again.
        Previously visited pages are still available.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--brand-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: 'var(--shadow-brand)',
          }}
        >
          🔄 Try Again
        </button>
        <a
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
          }}
        >
          🏠 Go Home
        </a>
      </div>

      <p style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Nyumba.rw — Rwanda's Property Platform
      </p>
    </div>
  );
}
