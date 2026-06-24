const CACHE_NAME = 'tanklabel-v8';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './ocr-engine.js',
  './export-utils.js',
  './digit-templates.js',
  './bluetooth-print.js',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png'
];

// Install: cache all assets, bypassando la cache HTTP del browser
// (altrimenti potremmo ottenere comunque una risposta vecchia anche se
// stiamo creando una cache nuova)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS.map(url =>
          fetch(url, { cache: 'no-cache' }).then(response => cache.put(url, response))
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches and take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first for HTML, cache fallback for rest
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // Always try network first for page navigation
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with fresh version
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request, { cache: 'no-cache' }).catch(() => caches.match('./index.html'));
      })
    );
  }
});

// Listen for messages from the page
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
