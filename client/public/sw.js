/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

// COMPLETELY DISABLED SERVICE WORKER - NO CACHING, NO API INTERFERENCE

console.log('Service Worker: COMPLETELY DISABLED - Will not handle any requests');

// Install event - Skip everything
self.addEventListener('install', (event) => {
  console.log('Service Worker: DISABLED - Installing');
  self.skipWaiting();
});

// Activate event - Clear all caches and take control
self.addEventListener('activate', (event) => {
  console.log('Service Worker: DISABLED - Activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('Service Worker: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: All caches cleared');
      return self.clients.claim();
    })
  );
});

// Fetch event - COMPLETELY BYPASS - Let browser handle everything
self.addEventListener('fetch', (event) => {
  // DO NOTHING - Let the browser handle all requests naturally
  console.log('Service Worker: BYPASSING request:', event.request.url);
  // By not calling event.respondWith(), the browser handles the request normally
});
