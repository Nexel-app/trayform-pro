// Service Worker — TrayForm Pro by Nexel
const CACHE_NAME = 'trayformpro-v3';
const BASE = '/trayform-pro';

// Assets à mettre en cache au démarrage
const PRECACHE_ASSETS = [
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/sw.js`,
  `${BASE}/icons/nexel-icon-72x72.png`,
  `${BASE}/icons/nexel-icon-96x96.png`,
  `${BASE}/icons/nexel-icon-128x128.png`,
  `${BASE}/icons/nexel-icon-144x144.png`,
  `${BASE}/icons/nexel-icon-152x152.png`,
  `${BASE}/icons/nexel-icon-192x192.png`,
  `${BASE}/icons/nexel-icon-384x384.png`,
  `${BASE}/icons/nexel-icon-512x512.png`
];

// ── Installation : précache de tous les assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Précache des assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Précache terminé');
        return self.skipWaiting();
      })
  );
});

// ── Activation : suppression des anciens caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Suppression ancien cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch : Network-first avec fallback cache ──
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET et hors domaine
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Mise en cache de la réponse réseau
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Hors-ligne : servir depuis le cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              console.log('[SW] Servi depuis le cache:', event.request.url);
              return cachedResponse;
            }
            // Fallback vers index.html pour la navigation
            if (event.request.mode === 'navigate') {
              return caches.match(`${BASE}/index.html`);
            }
            return new Response('Hors ligne - ressource non disponible', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
