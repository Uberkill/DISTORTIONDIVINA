// KILL SWITCH SERVICE WORKER
// This script is designed to replace any existing service worker and force-clear caches.

const CACHE_NAME = 'clear-cache-v1';

self.addEventListener('install', (event) => {
    // Force this new service worker to become active immediately, bypassing the wait
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // When this SW activates, clear all caches
    event.waitUntil(
        caches.keys().then((parsedCacheNames) => {
            return Promise.all(
                parsedCacheNames.map((cacheName) => {
                    console.log('Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            // Take control of all open pages immediately
            return self.clients.claim();
        }).then(() => {
            // Optional: Unregister self after cleaning up
            // We keep it active for now to handle fetch events just in case,
            // but you can unregister if you want no SW at all.
            // self.registration.unregister();
        })
    );
});

// Intercept all fetches and force them to go to the network
self.addEventListener('fetch', (event) => {
    // Do not use cache. Always fetch from network.
    // This ensures the user gets the latest index.html
    event.respondWith(
        fetch(event.request).catch(() => {
            // Fallback if offline (optional)
            return new Response("System Offline. Please check connection.");
        })
    );
});
