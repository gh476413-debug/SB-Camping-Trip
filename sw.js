/* SB Camping Trip service worker. Caches only this app's own files, scoped to this repo path. */
const CACHE = 'sbct-shell-2026.10.14-1648';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-32.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('sbct-') === 0 && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (/\/(trip|access)\.json$/.test(url.pathname)) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? './index.html' : req, copy)); }
      return res;
    }).catch(() => caches.match(req.mode === 'navigate' ? './index.html' : req).then(r => r || caches.match('./')))
  );
});
