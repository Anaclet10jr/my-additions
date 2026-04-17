/**
 * LanguageContext — EN / FR / Kinyarwanda
 * Loads translation files lazily, persists preference
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext(null);

const SUPPORTED = ['en', 'fr', 'rw'];
const DEFAULT = 'en';

// ─── Lazy load translation file ───────────────────────────
const loadTranslations = async (lang) => {
  try {
    const mod = await import(`../i18n/locales/${lang}.js`);
    return mod.default;
  } catch {
    console.warn(`Translation file for "${lang}" not found, falling back to EN`);
    const mod = await import('../i18n/locales/en.js');
    return mod.default;
  }
};

// ─── Nested key getter: t('nav.home') ─────────────────────
const getNestedValue = (obj, key) => {
  return key.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj);
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  const applyLanguage = useCallback(async (newLang) => {
    if (!SUPPORTED.includes(newLang)) newLang = DEFAULT;
    setLoading(true);
    const t = await loadTranslations(newLang);
    setTranslations(t);
    setLang(newLang);
    document.documentElement.setAttribute('lang', newLang);
    localStorage.setItem('nyumba_lang', newLang);
    setLoading(false);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('nyumba_lang');
    const browser = navigator.language?.split('-')[0];
    const initial = saved || (SUPPORTED.includes(browser) ? browser : DEFAULT);
    applyLanguage(initial);
  }, [applyLanguage]);

  // ─── Translation function ─────────────────────────────
  const t = useCallback((key, replacements = {}) => {
    const value = getNestedValue(translations, key);
    if (!value) return key; // fallback to key if missing

    // Replace {name}, {count}, etc.
    return Object.entries(replacements).reduce(
      (str, [k, v]) => str.replace(new RegExp(`{${k}}`, 'g'), v),
      value
    );
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: applyLanguage, t, loading, supported: SUPPORTED }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};
