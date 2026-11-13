import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { createServiceWorker } from './scripts/service-worker.mjs';
import session from './api/session.js';

export default defineConfig({
  plugins: [{
    name: 'nodepec-session',
    configureServer(server) { server.middlewares.use('/api/session', session); },
    configurePreviewServer(server) { server.middlewares.use('/api/session', session); },
  }, {
    name: 'nodepec-offline-shell',
    enforce: 'post',
    generateBundle(_, bundle) {
      const hash = createHash('sha256');
      // Public-file and content-only edits must also create a fresh cache version.
      for (const file of ['index.html', 'public/icon.svg', 'public/web.ico', 'public/manifest.webmanifest']) {
        hash.update(readFileSync(new URL(file, import.meta.url)));
      }
      for (const [name, item] of Object.entries(bundle).sort()) {
        hash.update(name);
        hash.update(item.type === 'chunk' ? item.code : item.source);
      }
      const assets = [...new Set(['/index.html', '/icon.svg', '/web.ico', '/manifest.webmanifest', ...Object.keys(bundle).map(name => `/${name}`)])];
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: createServiceWorker(hash.digest('hex').slice(0, 16), assets) });
    },
  }],
  build: { target: 'es2022' },
});
