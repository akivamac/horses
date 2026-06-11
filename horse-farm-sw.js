// Clover Hill Farm — Service Worker
// Handles caching, offline support, and persistent save data

const CACHE_NAME = 'clover-hill-v1';
const SAVE_STORE = 'clover-hill-saves';

// Files to cache for offline use
const CACHE_FILES = [
  './horse-farm.html',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Nunito:wght@400;700;800&display=swap',
];

// ================================================================
// INSTALL — cache all app files
// ================================================================
self.addEventListener('install', event => {
  console.log('[SW] Installing Clover Hill Farm service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES).catch(err => {
        // Font CDN might fail offline — that's ok
        console.warn('[SW] Some files failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ================================================================
// ACTIVATE — clean up old caches
// ================================================================
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ================================================================
// FETCH — serve from cache, fall back to network
// ================================================================
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Serve cached version immediately
        // Also fetch fresh version in background to update cache
        const fetchPromise = fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {}); // ignore network errors
        return cached;
      }
      // Not in cache — fetch from network
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Totally offline and not cached — return a friendly offline page
        if (event.request.destination === 'document') {
          return caches.match('./horse-farm.html');
        }
      });
    })
  );
});

// ================================================================
// SAVE DATA — persistent storage via Cache API
// More reliable than localStorage on Android
// ================================================================

// Save farm data — called from the main page
self.addEventListener('message', event => {
  const { type, key, value } = event.data || {};

  if (type === 'SAVE') {
    // Store save data in a dedicated cache
    caches.open(SAVE_STORE).then(cache => {
      const response = new Response(value, {
        headers: { 'Content-Type': 'text/plain' }
      });
      cache.put('./save/' + key, response);
    });
    event.ports[0]?.postMessage({ ok: true });
  }

  if (type === 'LOAD') {
    caches.open(SAVE_STORE).then(cache => {
      cache.match('./save/' + key).then(response => {
        if (response) {
          response.text().then(text => {
            event.ports[0]?.postMessage({ ok: true, value: text });
          });
        } else {
          event.ports[0]?.postMessage({ ok: false, value: null });
        }
      });
    });
  }

  if (type === 'DELETE') {
    caches.open(SAVE_STORE).then(cache => {
      cache.delete('./save/' + key);
    });
    event.ports[0]?.postMessage({ ok: true });
  }
});

// ================================================================
// BACKGROUND SYNC — auto-save when connection restored
// ================================================================
self.addEventListener('sync', event => {
  if (event.tag === 'farm-autosave') {
    console.log('[SW] Background sync triggered');
    // The main page handles the actual save logic
    // This just wakes up the SW to ensure the cache is warm
  }
});

console.log('[SW] Clover Hill Farm service worker loaded!');
