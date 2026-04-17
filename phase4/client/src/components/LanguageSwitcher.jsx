/**
 * LanguageSwitcher — Dropdown to switch EN/FR/RW
 * Integrates with LanguageContext
 */
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', short: 'FR' },
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼', short: 'RW' },
];

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: compact ? '0.35rem 0.6rem' : '0.5rem 0.875rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          transition: 'all var(--transition)',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{current.flag}</span>
        {!compact && <span>{current.short}</span>}
        <span
          style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--transition)',
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            minWidth: '160px',
            zIndex: 1000,
            animation: 'fadeUp 0.15s ease forwards',
          }}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={l.code === lang}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                padding: '0.625rem 0.875rem',
                background: l.code === lang ? 'var(--brand-bg)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: l.code === lang ? 600 : 400,
                color: l.code === lang ? 'var(--brand-primary)' : 'var(--text-primary)',
                textAlign: 'left',
                transition: 'background var(--transition)',
              }}
              onMouseEnter={(e) => {
                if (l.code !== lang) e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                if (l.code !== lang) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{l.flag}</span>
              <span>{l.label}</span>
              {l.code === lang && (
                <span style={{ marginLeft: 'auto', color: 'var(--brand-primary)', fontSize: '0.8rem' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
