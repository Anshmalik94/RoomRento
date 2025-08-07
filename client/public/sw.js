/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

// Disabled Service Worker to prevent API interference

const CACHE_NAME = 'roomrento-disabled';

// Install event - Skip caching
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install - Caching disabled');
  // Skip waiting to immediately activate
  self.skipWaiting();
});

// Fetch event - Always use network, never cache API calls
self.addEventListener('fetch', (event) => {
  // For API calls, always fetch from network
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('localhost:5000') ||
      event.request.url.includes('roomrento.onrender.com')) {
    
    console.log('Service Worker: Bypassing cache for API call:', event.request.url);
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          console.log('Service Worker: Network response:', response.status, event.request.url);
          return response;
        })
        .catch(error => {
          console.log('Service Worker: Network error:', error, event.request.url);
          throw error; // Re-throw to let the app handle it
        })
    );
    return;
  }

  // For static files, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Activate event - Clear old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate - API caching disabled');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});
