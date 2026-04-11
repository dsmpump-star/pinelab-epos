// Card EPOS Checker — Service Worker
const CACHE_NAME = 'card-epos-v1';
const ASSETS = [
  '/pinelab-epos/index.html',
  '/pinelab-epos/manifest.json',
  '/pinelab-epos/icon-192.png',
  '/pinelab-epos/icon-512.png'
];

// Install — cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip Google Sheets API requests — always go to network
  if (e.request.url.includes('script.google.com')) return;
  
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache fresh copy of app files
        if (e.request.url.includes('/pinelab-epos/')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notification support (future)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Card EPOS Checker', {
      body: data.body || 'Check your pending balance',
      icon: '/pinelab-epos/icon-192.png',
      badge: '/pinelab-epos/icon-192.png',
      tag: 'epos-notification'
    })
  );
});

// Background sync for daily ledger reminder
self.addEventListener('sync', e => {
  if (e.tag === 'daily-ledger') {
    e.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'DOWNLOAD_LEDGER' }));
      })
    );
  }
});
