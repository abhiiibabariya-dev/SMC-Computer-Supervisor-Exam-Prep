/* SMC Exam Prep — Service Worker
 * Strategy:
 *   - HTML navigations: network-first (fresh content), fall back to cache, then offline page.
 *   - Static assets (js/css/png/svg/json): stale-while-revalidate (instant load, refresh in bg).
 * Bump CACHE version to force clients to pick up new precached assets.
 */
const CACHE = 'smc-v2';
const CORE = [
  './',
  './index.html',
  './daily-quiz.html',
  './quiz.html',
  './leaderboard.html',
  './mock-test.html',
  './exam.html',
  './offline.html',
  './daily-content.js',
  './mcq-bank.js',
  './i18n.js',
  './tracker.js',
  './share.js',
  './gate.js',
  './pwa.js',
  './firebase-config.js',
  './icon-192.png',
  './icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(CORE.map((u) => c.add(u))))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isHTML(req) {
  return req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only handle same-origin; let cross-origin (Firebase, CDNs, fonts) go to network.
  if (url.origin !== self.location.origin) return;

  if (isHTML(req)) {
    // network-first
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./offline.html')))
    );
    return;
  }

  // static: stale-while-revalidate
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
