/**
 * Service Worker Configuration
 * Handles local caching strategies for offline support and faster subsequent loads.
 */

const CACHE_ID = 'iapt-ar-v1';

self.addEventListener('install', event => {
  // Defer caching to runtime to avoid heavy initial installation overhead
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.filter(name => name !== CACHE_ID).map(name => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Implementation of Cache-First Strategy with Network Fallback
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        const requestUrl = event.request.url;
        
        // Only cache specific static resources
        const isCacheable =
          requestUrl.includes('/ar-app/libs/') ||
          requestUrl.includes('/ar-app/assets/') ||
          requestUrl.includes('.mind') ||
          requestUrl.includes('.mp4') ||
          requestUrl.includes('aframe') ||
          requestUrl.includes('mindar');

        if (isCacheable && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_ID).then(cacheStore => cacheStore.put(event.request, responseClone));
        }

        return networkResponse;
      }).catch(() => cachedResponse || new Response('Service Unavailable', { status: 503 }));
    })
  );
});
