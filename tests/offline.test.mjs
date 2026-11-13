import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createServiceWorker } from '../scripts/service-worker.mjs';

function worker(existing = []) {
  const listeners = new Map();
  const stores = new Map(existing.map(key => [key, new Map()]));
  let skips = 0;
  let claims = 0;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async addAll(paths) { for (const path of paths) store.set(path, `cached:${path}`); },
        async match(path) { return store.get(path); },
      };
    },
    async has(name) { return stores.has(name); },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
  };
  vm.runInNewContext(createServiceWorker('test', ['/index.html', '/assets/main.js']), {
    URL, Set, caches,
    fetch() { throw new Error('Network is offline'); },
    self: { location: { origin: 'https://bio.test' }, addEventListener(name, handler) { listeners.set(name, handler); }, async skipWaiting() { skips++; }, clients: { async claim() { claims++; } } },
  });
  return {
    stores,
    get skips() { return skips; },
    get claims() { return claims; },
    async dispatch(name, options = {}) {
      let pending;
      listeners.get(name)({ ...options, waitUntil(promise) { pending = promise; }, respondWith(promise) { pending = promise; } });
      return await pending;
    },
  };
}

test('the shell and built assets work without a network after installation', async () => {
  const service = worker();
  await service.dispatch('install');
  assert.equal(service.skips, 0, 'new versions wait for explicit approval');
  assert.equal(await service.dispatch('fetch', { request: { method: 'GET', mode: 'navigate', url: 'https://bio.test/?visit=2' } }), 'cached:/index.html');
  assert.equal(await service.dispatch('fetch', { request: { method: 'GET', mode: 'cors', url: 'https://bio.test/assets/main.js' } }), 'cached:/assets/main.js');
});

test('unrelated requests and other applications are not captured or deleted', async () => {
  const service = worker(['other-app', 'bio-v1', 'nodepec-shell-old']);
  await service.dispatch('install');
  assert.equal(service.skips, 1, 'the legacy worker can migrate');
  await service.dispatch('activate');
  assert.deepEqual([...service.stores.keys()].sort(), ['nodepec-shell-test', 'other-app']);
  assert.equal(service.claims, 1);
  for (const request of [
    { method: 'POST', mode: 'cors', url: 'https://bio.test/' },
    { method: 'GET', mode: 'cors', url: 'https://other.test/assets/main.js' },
    { method: 'GET', mode: 'navigate', url: 'https://bio.test/missing' },
    { method: 'GET', mode: 'cors', url: 'https://bio.test/api/data' },
  ]) assert.equal(await service.dispatch('fetch', { request }), undefined);
});

test('only the explicit update message activates a waiting version', async () => {
  const service = worker();
  await service.dispatch('message', { data: { type: 'other' } });
  assert.equal(service.skips, 0);
  await service.dispatch('message', { data: { type: 'SKIP_WAITING' } });
  assert.equal(service.skips, 1);
});
