/* Petualangan Gigi Sehat — Service Worker
 * Provides offline support for the kids dental health site.
 * Strategy:
 *   - HTML requests: network-first (fresh content, fall back to cache)
 *   - JS requests:    cache-first (static assets rarely change)
 *   - Offline:        serve any cached match as a fallback
 */

const CACHE_NAME = 'gigi-sehat-v1';
const OFFLINE_CACHE = 'gigi-sehat-offline-v1';

// All site files to pre-cache so the app works offline.
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'tooth4.js',
  'tooth3d.js',
  'cavitarus3d.js',
  'sikat3d.js',
  'benang3d.js',
  'pasta3d.js',
  'kuman3d.js',
  'manifest.json',
  'icon.svg'
];

// Install: precache everything.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: drop old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== OFFLINE_CACHE) {
            return caches.delete(key);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: route by request type.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.headers.get('accept').includes('text/html')) {
    // Network-first for HTML.
    event.respondWith(networkFirst(request));
  } else if (url.pathname.endsWith('.js') || url.pathname.endsWith('.mjs')) {
    // Cache-first for JS.
    event.respondWith(cacheFirst(request));
  } else {
    // Default: cache-first with offline fallback.
    event.respondWith(cacheFirst(request));
  }
});

// Network-first: try network, fall back to cache, then a generic offline page.
function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      // Cache a copy of the fresh response.
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    })
    .catch(() => {
      return caches.match(request)
        .then((cached) => cached || caches.match('index.html'))
        .then((fallback) => fallback || offlineResponse());
    });
}

// Cache-first: serve from cache, fall back to network, then offline.
function cacheFirst(request) {
  return caches.match(request)
    .then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => offlineResponse());
    });
}

// Generic offline fallback when nothing is cached.
function offlineResponse() {
  const body = '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Petualangan Gigi Sehat</title>' +
    '<style>body{font-family:sans-serif;text-align:center;background:#FFF8F0;' +
    'color:#FF6B9D;padding:40px}h1{font-size:2rem}p{font-size:1.1rem}</style>' +
    '</head><body><h1>🦷 Hai Riko!</h1>' +
    '<p>Kamu sedang offline. Coba lagi nanti ya!</p></body></html>';
  return new Response(body, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
