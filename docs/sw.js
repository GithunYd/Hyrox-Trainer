/* Bump the version when any shell asset changes. Cache is isolated to this app scope. */
const PREFIX = 'phoenix-hyrox-' + new URL(self.registration.scope).pathname;
const CACHE = PREFIX + 'v4';
const ASSETS = ['./', './index.html', './style.css', './app.js', './planner.js', './plan.json', './manifest.webmanifest', './icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.match(new URL('./index.html', self.registration.scope).href).then(cached => cached || fetch(event.request)));
    return;
  }
  // Versioned app shell remains consistent; unknown assets never become an HTML response.
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
