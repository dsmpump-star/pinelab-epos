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

messaging.onBackgroundMessage(payload => {
  if (payload.notification) return;
  const { title, body, icon } = payload.data || {};
  self.registration.showNotification(title || 'Card EPOS Checker', {
    body: body || 'New entry saved',
    icon: icon || '/pinelab-epos/icon-192.png',
    badge: '/pinelab-epos/icon-192.png',
    tag: 'epos-notification',
    data: payload.data || {}
  });
});

// NO PWA caching - always fetch fresh from network
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  // Clear ALL old caches on activate
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
  self.clients.claim();
});
// No fetch handler - browser fetches normally
