// Service Worker — TrayForm Pro by Nexel
const CACHE_NAME = 'trayformpro-v3';
const BASE = '/trayform-pro';
const ASSETS = [
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/icons/nexel-icon-192x192.png`,
  `${BASE}/icons/nexel-icon-512x512.png`
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        return caches.match(`${BASE}/index.html`);
      });
    })
  );
});
