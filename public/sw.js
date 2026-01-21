const CACHE_NAME = 'brainzrr-audio-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only intercept audio stream requests
  if (url.pathname === '/api/stream') {
    event.respondWith(handleStreamRequest(event.request));
  }
});

async function handleStreamRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    
    // We can only cache successful full responses (not partial content unless handled specifically)
    // Next.js server returns 200 with the full stream or 206 if we implemented ranges.
    // Our current implementation returns 200 for new streams and 200 for cached files (without range handling yet).
    if (response.ok) {
      // Clone the response to store it in cache
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }

    return response;
  } catch (error) {
    console.error('SW fetch failed:', error);
    return fetch(request);
  }
}
