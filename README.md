
# nodepec / session://bio

A personal terminal portfolio for learning, building, and exploring

## Run locally

Requires Node.js 22.12+ (Node 24 LTS recommended).

```sh
npm ci
npm run dev
```

Vite prints the local development URL and reloads changes automatically. The production service worker is deliberately disabled in development.

```sh
npm test         # command parsing, navigation, safety, and offline lifecycle
npm run build    # strict TypeScript check + production bundle
npm start        # serve dist/ on port 3000
```

`PORT` changes the production port. Set `NODE_ENV=production` behind HTTPS to enable HSTS and HTTPS upgrade policy. `npm run preview` is also available for checking the build.

## Features

- Profile, about, skills, project, writeups directory, and external links. No invented project metrics or challenge writeups.
- Native accessible tabs with arrow/Home/End navigation, shareable hash links, browser back/forward, and a readable no-JavaScript fallback.
- Ctrl/Cmd K command palette with search and keyboard selection.
- Browser shell: `help`, `whoami`, `ls`, `cd`, `cat`, `open`, `pwd`, `neofetch`, `date`, `uptime`, `history`, `echo`, `theme`, `effects`, `matrix`, `clear`, `reboot`, and `exit`. Page names also work as commands. No commands execute on the visitor's device.
- Up/down command history, Tab completion, Ctrl/Cmd L clear, and literal text output (no HTML evaluation).
- Black and blue design with blue, cobalt, and ice accents; preferences stored locally. Ambient effects respect reduced motion, but explicitly running `matrix` always plays it. Matrix stops on any key, dismissal, or when the page is hidden.
- The original-style boot screen opens on arrival with the ASCII cat, network state, live visitor IP, detected OS/browser, and uptime. Press Enter or tap to continue. Boot replay remains available.
- The terminal fits the dynamic viewport with compact responsive layouts and a final content-fit pass for short windows. Only long command history scrolls inside its own log.
- Visitor IP comes from the same-origin `/api/session` Vercel function (also supported by the local server and Vite). It uses Vercel's forwarded client address in production and the socket locally. Responses are private/no-store, and no external IP provider is contacted. Offline/missing API shows `unavailable` and never blocks entry.
- Versioned native service worker precaches the actual built files. Updates show a reload prompt. Cache cleanup is limited to this site's own caches; third-party/API requests are excluded. Offline support needs HTTPS or localhost and a completed first online visit.

## Implementation

TypeScript 7, Vite 8, native ES modules, CSS cascade layers, CSS Grid, native dialogs, and the Canvas and Service Worker APIs. Express 5, Helmet, and compression serve the production bundle with a Content Security Policy and immutable hashed-asset caching. Dependencies are pinned and locked. No UI framework or external font/image requests are needed.

- `index.html`: semantic content and six panels.
- `src/style.css`: responsive layout and themes.
- `src/main.ts`: navigation, palette, preferences, session UI, and update prompts.
- `src/commands.ts`: typed command parser, completion, and dispatch.
- `src/effects.ts`: optional canvas effect and lifecycle cleanup.
- `src/client.ts`: browser/OS detection and same-origin session lookup.
- `api/session.js`: visitor-only IP endpoint, deployed automatically by Vercel.
- `scripts/service-worker.mjs`: dependency-free offline worker generator, connected through `vite.config.ts`.
- `public/`: original favicon, new vector icon, and web app manifest.

On Vercel, use the Vite preset, build with `npm run build`, and serve `dist/`. The root `api/session.js` function provides live IP details automatically. For a purely static host, upload `dist/` at the domain root with HTTPS; the site works but IP is unavailable without an equivalent `/api/session` endpoint. Serve HTML, `sw.js`, and the manifest with revalidation; hashed `/assets/` files can be cached immutably. Navigation uses hash fragments, so no server rewrite is needed. External GitHub/CTFtime links require an internet connection.

Author: [@nodepec](https://github.com/nodepec)
