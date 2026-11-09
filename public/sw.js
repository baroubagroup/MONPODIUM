// MonPodium Service Worker for PWA 1-Click Native Installation & Offline Caching
const CACHE_NAME = 'monpodium-cache-v1'

self.addEventListener('install', (event) => {
  // Activate immediately without waiting for old clients to close
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Required for Chromium beforeinstallprompt & native PWA installability
self.addEventListener('fetch', (event) => {
  // Let browser handle non-GET or cross-origin requests normally
  if (event.request.method !== 'GET') return

  // Network first with fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse
      })
      .catch(async () => {
        const cached = await caches.match(event.request)
        if (cached) return cached
        return new Response('Offline', { status: 503, statusText: 'Offline' })
      })
  )
})
