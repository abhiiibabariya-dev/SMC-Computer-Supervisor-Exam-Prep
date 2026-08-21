/* Gujarat Govt Jobs Hub — Service Worker
 * Strategy:
 *   - HTML navigations: network-first (fresh content), fall back to cache, then offline page.
 *   - Static assets: stale-while-revalidate.
 *   - Authentication-critical files are always fetched from the network so an old
 *     cached login/profile gate cannot survive a deployment.
 */
const CACHE = 'smc-v5';
const CORE = [
  './',
  './index.html',
  './daily-quiz.html',
  './quiz.html',
  './leaderboard.html',
  './mock-test.html',
  './exam.html',
  './exam-day.html',
  './answer-key.html',
  './revision-plan.html',
  './progress.html',
  './offline.html',
  './daily-content.js',
  './mcq-bank.js',
  './i18n.js',
  './tracker.js',
  './share.js',
  './enhance.js',
  './growth.js',
  './pwa.js',
  './firebase-config.js',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './manifest.webmanifest'
];

const AUTH_CRITICAL = new Set([
  'gate.js',
  'login.html',
  'profile-setup.html',
  'client-dashboard.html',
  'admin-subscriptions.html'
]);

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

function isAuthCritical(url) {
  return AUTH_CRITICAL.has(url.pathname.split('/').pop() || '');
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache authentication gates/pages. This prevents stale auth code or a
  // stale profile-save page from surviving a deployment.
  if (isAuthCritical(url)) {
    e.respondWith(fetch(req, { cache: 'no-store' }));
    return;
  }

  if (isHTML(req)) {
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
