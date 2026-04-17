# Nyumba.rw — Phase 4: Dark Mode, i18n, Advanced Search, PWA & SEO

## What's New in Phase 4

| Feature | Files | Status |
|---|---|---|
| Dark / Light mode | `ThemeContext.jsx`, `ThemeToggle.jsx`, `globals.css` | ✅ Complete |
| Multilanguage EN/FR/RW | `LanguageContext.jsx`, `LanguageSwitcher.jsx`, `locales/` | ✅ Complete |
| Advanced search & filters | `AdvancedSearch.jsx` | ✅ Complete |
| PWA support | `manifest.json`, `sw.js`, `usePWA.jsx` | ✅ Complete |
| SEO landing pages | `seo.js`, `[seo-slug]/page.jsx` | ✅ Complete |
| Performance / low-bandwidth | `usePerformance.jsx` | ✅ Complete |
| Updated Navbar | `Navbar.jsx` | ✅ Complete |
| Next.js config | `next.config.js` | ✅ Complete |
| Root layout | `app/layout.jsx` | ✅ Complete |

---

## Integration Steps (5 Steps)

### Step 1 — Copy files into your project

```
phase4/client/src/context/          → client/src/context/
phase4/client/src/hooks/            → client/src/hooks/
phase4/client/src/i18n/             → client/src/i18n/
phase4/client/src/components/       → client/src/components/   (merge)
phase4/client/src/lib/seo.js        → client/src/lib/seo.js
phase4/client/src/styles/globals.css → client/src/styles/globals.css  (REPLACE)
phase4/client/src/app/layout.jsx    → client/src/app/layout.jsx  (REPLACE)
phase4/client/src/app/[seo-slug]/   → client/src/app/[seo-slug]/
phase4/client/public/manifest.json  → client/public/manifest.json
phase4/client/public/sw.js          → client/public/sw.js
phase4/client/next.config.js        → client/next.config.js  (REPLACE)
```

### Step 2 — Wrap your app in providers

Your `app/layout.jsx` already does this. If you have an existing layout, ensure it matches:

```jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
```

### Step 3 — Replace your Navbar

```bash
cp phase4/client/src/components/Navbar.jsx client/src/components/Navbar.jsx
```

The new Navbar includes:
- Language switcher (compact flag dropdown)
- Dark/light mode toggle (animated)
- Responsive mobile menu with slide-in overlay

### Step 4 — Add icons for PWA

Create the `/public/icons/` folder and generate icons from your logo:

```bash
# Install sharp-based icon generator
npx pwa-asset-generator logo.png ./public/icons --manifest ./public/manifest.json
```

Required sizes: 72, 96, 128, 144, 152, 192, 384, 512px

### Step 5 — Add env variable

```bash
# client/.env.local
NEXT_PUBLIC_APP_URL=https://nyumba.rw
```

---

## How Dark Mode Works

1. On load, a tiny inline `<script>` in `<head>` reads `localStorage` before React hydrates — **no flash**
2. `ThemeProvider` syncs React state with the `data-theme` attribute on `<html>`
3. All colors are CSS variables — dark theme simply overrides them
4. System preference is respected unless user explicitly toggles

```css
/* Light */
:root { --bg-primary: #FAFAF8; --brand-primary: #2D6A4F; }

/* Dark */
[data-theme='dark'] { --bg-primary: #0F1110; --brand-primary: #52B788; }
```

---

## How Multilanguage Works

```jsx
// In any component:
const { t, lang, setLang } = useLanguage();

t('nav.home')              // → "Home" / "Accueil" / "Ahabanza"
t('home.trusted_by', { count: 1200 }) // → "Trusted by 1200+ Rwandans"
```

Translation files are **lazy-loaded** — only the active language is loaded.

---

## SEO Landing Pages

Auto-generated static pages at build time:

| URL | Target keyword |
|---|---|
| `/houses-for-rent-kigali` | houses for rent kigali |
| `/apartments-kicukiro` | apartments kicukiro |
| `/homes-nyarutarama` | nyarutarama homes |
| `/buy-land-kigali` | buy land kigali |
| `/interior-designers-kigali` | interior designers kigali |
| `/homes-remera` | homes remera kigali |

Add more in `src/lib/seo.js → SEO_LANDING_PAGES`.

---

## PWA Features

- **Offline support**: Previously visited pages work without internet
- **Install banner**: "Add to Home Screen" prompt on mobile
- **Push notifications**: Booking updates, price changes (requires backend setup)
- **Background sync**: Failed booking requests retry automatically when online
- **Network-adaptive images**: Cloudinary URLs adjusted to connection speed

---

## Advanced Search — URL Params

The search component syncs with URL query params, making searches shareable/bookmarkable:

```
/search?type=rent&district=Gasabo&minPrice=100000&maxPrice=500000&bedrooms=2&amenities=wifi,parking&isAvailable=true
```

---

## Phase 5 Preview

Next phase covers:
- **MTN MoMo + Airtel Money** payment integration
- **Digital contract signing** (signature pad + PDF generation)
- **Review & ratings** system
- **Verification badge** workflow (KYC upload + admin approval)
- **Super admin analytics** dashboard (charts, heatmaps)
