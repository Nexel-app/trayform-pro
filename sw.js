// Service Worker — TrayForm Pro by Nexel
const CACHE_NAME = 'trayformpro-v2';
const BASE = '/trayform-pro';
const ASSETS = [
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/icons/nexel-icon-192x192.png`,
  `${BASE}/icons/nexel-icon-512x512.png`
];

// Installation : mise en cache des assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : Network-first — réseau en priorité, cache si hors-ligne
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mise à jour du cache avec la nouvelle version
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Hors-ligne : on sert le cache
        return caches.match(event.request).then(cached =>
          cached || caches.match(`${BASE}/index.html`)
        );
      })
  );
});
