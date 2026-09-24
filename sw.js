const CACHE_NAME = 'v1_cache';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/global.css',
  '/src/responsive.css',
  '/src/VCWC.css',
  '/index.js',
  '/speech.js',
  '/UI.js'
];

// 1. Install Event: Cache core application assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching core assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activate Event: Clean up old caches if versions change
self.addEventListener('activate', event => {
  console.log('Service Worker activated.');
});

// 3. Fetch Event: Intercept network requests and serve from cache if offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached asset, or fall back to network
      return response || fetch(event.request);
    })
  );
});
