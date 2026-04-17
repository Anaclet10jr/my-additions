/**
 * Nyumba.rw Service Worker
 * Strategy:
 *  - Static assets: Cache First (long-lived)
 *  - API GET requests: Network First with 3s timeout, fallback to cache
 *  - API POST/PATCH: Network only (no caching mutations)
 *  - Offline fallback page served for navigation requests
 */

const CACHE_VERSION = 'nyumba-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// ─── Files to pre-cache on install ───────────────────────
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/rentals',
  '/manifest.json',
  '/icons/icon-192x192.png',
];

// ─── Install: pre-cache static assets ────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Nyumba.rw service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ──────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('nyumba-') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: intercept requests ────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET for API (mutations must go through)
  if (request.method !== 'GET') return;

  // Skip chrome-extension, websocket, socket.io
  if (!url.protocol.startsWith('http')) return;
  if (url.pathname.startsWith('/socket.io')) return;

  // ─── API requests: Network First ──────────────────────
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, 3000));
    return;
  }

  // ─── Static assets: Cache First ───────────────────────
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|ico)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ─── Navigation (HTML pages): Network First ───────────
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstWithCache(request, DYNAMIC_CACHE, 5000).catch(() =>
        caches.match('/offline')
      )
    );
    return;
  }

  // ─── Everything else: Network First ───────────────────
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE, 5000));
});

// ─── Strategy: Cache First ────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

// ─── Strategy: Network First with timeout ────────────────
async function networkFirstWithCache(request, cacheName, timeoutMs = 5000) {
  const cache = await caches.open(cacheName);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network failed or timed out — try cache
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cached;
    }
    throw new Error('Network failed and no cache available');
  }
}

// ─── Background sync: retry failed bookings ──────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncPendingBookings());
  }
});

async function syncPendingBookings() {
  // In production: read from IndexedDB, retry POST requests
  console.log('[SW] Syncing pending bookings...');
}

// ─── Push notifications ───────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const { title = 'Nyumba.rw', body = 'You have a new notification', icon = '/icons/icon-192x192.png', url = '/' } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/icons/badge-72x72.png',
      data: { url },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
