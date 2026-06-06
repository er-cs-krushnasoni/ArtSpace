// frontend/public/sw.js
const CACHE_NAME = 'artspace-admin-v3'; // bumped to clear old broken cache

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept API calls
  if (url.pathname.startsWith('/api/')) return;

  // Never cache favicons/logos — always network
  if (
    url.pathname.endsWith('.ico') ||
    url.pathname.includes('favicon') ||
    url.pathname.includes('artspace-logo')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => new Response('', { status: 408 }))
    );
    return;
  }

  // Navigation: network-first, fallback to index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // JS/CSS/SVG/WEBP: cache-first, network fallback — NEVER let it throw
  const isCacheable =
    url.origin === self.location.origin &&
    (url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.webp'));

  if (isCacheable) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {
            // Critical: never let a JS module fetch throw —
            // returning a 503 is safer than an unhandled rejection
            // that corrupts the React module graph
            return new Response('', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
    );
    return;
  }

  // Everything else: plain network, no SW interference
  // (pwa-manifest.json, fonts, external assets, etc.)
  event.respondWith(
    fetch(event.request).catch(() => new Response('', { status: 408 }))
  );
});