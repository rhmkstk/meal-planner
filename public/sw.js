const CACHE_VERSION = 'weakly-meal-planner-v1'
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`

const APP_SHELL_ASSETS = [
  '/offline.html',
  '/manifest.webmanifest',
  '/logo/WMP-logo.png',
  '/icons/icon-32.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => !cacheName.startsWith(CACHE_VERSION))
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(request.url)

  if (requestUrl.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  if (isStaticAsset(requestUrl)) {
    event.respondWith(cacheFirst(request))
  }
})

async function networkFirstNavigation(request) {
  try {
    return await fetch(request)
  } catch {
    return await caches.match('/offline.html')
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  const response = await fetch(request)
  const cache = await caches.open(RUNTIME_CACHE)
  cache.put(request, response.clone())
  return response
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/_nuxt/')
    || url.pathname.startsWith('/icons/')
    || url.pathname.startsWith('/logo/')
    || url.pathname === '/manifest.webmanifest'
}
