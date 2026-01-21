/**
 * DISTORTION OS SERVICE WORKER
 * ----------------------------
 * IMPORTANT: To release a new update to users, you MUST change the CACHE_NAME below.
 * Example: 'distortion-os-v1' -> 'distortion-os-v2'
 */
const CACHE_NAME = 'distortion-os-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/script.js',
    '/js/data.js',
    // We can add critical images here if needed, but we rely on browser cache for most
];

// 1. INSTALL: Cache Core Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching Core Assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Force activation immediately
});

// 2. ACTIVATE: Cleanup Old Caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Clearing Old Cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control of all clients
});

// 3. FETCH: Cache First, Network Fallback
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Ignore non-http (e.g., chrome-extension)
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // Network Request
            return fetch(event.request).then((networkResponse) => {
                // If valid response, clone and cache (Dynamic Caching for Assets)
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // Optional: Cache dynamically loaded assets (images)
                // We keep it simple for now to avoid bloating storage
                return networkResponse;
            });
        })
    );
});
