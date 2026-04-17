/**
 * ThemeToggle — Animated sun/moon toggle button
 * Drop into Navbar or Settings panel
 */
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ size = 'md', showLabel = false }) {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizes = {
    sm: { btn: '32px', icon: '16px' },
    md: { btn: '40px', icon: '20px' },
    lg: { btn: '48px', icon: '24px' },
  };
  const s = sizes[size];

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: showLabel ? 'auto' : s.btn,
        height: s.btn,
        padding: showLabel ? '0 0.75rem' : undefined,
        justifyContent: 'center',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        color: 'var(--text-secondary)',
        fontSize: s.icon,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)',
          fontSize: s.icon,
          lineHeight: 1,
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
      {showLabel && (
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
