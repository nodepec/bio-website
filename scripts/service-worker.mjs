/** Generate a same-origin, versioned precache without a runtime dependency. */
export function createServiceWorker(version, assets) {
  return `
const CACHE = ${JSON.stringify(`nodepec-shell-${version}`)};
const ASSETS = ${JSON.stringify(assets)};
const PATHS = new Set(ASSETS);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    // Migrate the original worker, which has no update notification UI.
    if (await caches.has('bio-v1')) await self.skipWaiting();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE && (key === 'bio-v1' || key.startsWith('nodepec-shell-'))).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const shell = event.request.mode === 'navigate' && ['/', '/index.html'].includes(url.pathname);
  if (!shell && !PATHS.has(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(shell ? '/index.html' : url.pathname)) || fetch(event.request);
  })());
});
`;
}
