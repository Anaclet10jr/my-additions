/**
 * ThemeContext — Dark/Light mode with system preference detection
 * Persisted to localStorage, applied via data-theme on <html>
 */
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read saved preference or fall back to system preference
    const saved = localStorage.getItem('nyumba_theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = saved || system;
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    setMounted(true);

    // Listen for OS-level changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem('nyumba_theme')) {
        const next = e.matches ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('nyumba_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const setExplicitTheme = (t) => {
    setTheme(t);
    localStorage.setItem('nyumba_theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  // Prevent flash of wrong theme on SSR
  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setExplicitTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
