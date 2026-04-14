// Card EPOS Checker — Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA_nJVzzbNsTLwNGwxZaf8RpaniXDMETFM",
  authDomain: "dsm-qr-notifications.firebaseapp.com",
  projectId: "dsm-qr-notifications",
  storageBucket: "dsm-qr-notifications.firebasestorage.app",
  messagingSenderId: "522523299808",
  appId: "1:522523299808:web:9f86a2eafa2fe054446585"
});

const messaging = firebase.messaging();

// Handle background messages (when app is closed/minimized)
messaging.onBackgroundMessage(payload => {
  console.log('[FCM] EPOS Background message:', payload);
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Card EPOS Checker', {
    body: body || 'New entry saved',
    icon: icon || '/pinelab-epos/icon-192.png',
    badge: '/pinelab-epos/icon-192.png',
    tag: 'epos-notification',
    data: payload.data || {}
  });
});

// PWA cache logic
const CACHE_NAME = 'card-epos-v2';
const ASSETS = [
  '/pinelab-epos/index.html',
  '/pinelab-epos/manifest.json',
  '/pinelab-epos/icon-192.png',
  '/pinelab-epos/icon-512.png',
  '/pinelab-epos/firebase-messaging-sw.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('script.google.com') ||
      e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis')) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
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
