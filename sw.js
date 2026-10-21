const CACHE_VERSION = 'doctorpc-v1.2.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/script.js',
  './img/LogoDoctorPC.jpeg',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png',
  './img/icons/icon-maskable-512.png',
  './img/icons/apple-touch-icon.png'
];
const scopedUrl = (path) => new URL(path, self.registration.scope).href;
const freshRequest = (path) => new Request(scopedUrl(path), { cache: 'reload' });

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL.map(freshRequest)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('doctorpc-') && ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          return (await caches.match(request))
            || (await caches.match(scopedUrl('./index.html')))
            || caches.match(scopedUrl('./offline.html'));
        })
    );
    return;
  }

  const needsFreshVersion = ['style', 'script'].includes(request.destination)
    || /\.(?:html|css|js|webmanifest)$/.test(url.pathname);

  if (needsFreshVersion) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response?.status === 200) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }))
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request).then((response) => {
      if (!response || response.status !== 200) return response;
      const copy = response.clone();
      caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
      return response;
    }))
  );
});
