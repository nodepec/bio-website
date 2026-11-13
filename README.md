
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
- Black and blue design with blue, cobalt, and ice accents; preferences stored locally. Existing amber/green preferences reset to blue. System reduced motion always wins. The blue Matrix canvas stops on any key, on dismissal, or when the page is hidden.
- Optional boot replay, copy handle, Perth clock, session uptime, and network state.
- Versioned native service worker precaches the actual built files. Updates show a reload prompt. Cache cleanup is limited to this site's own caches; third-party/API requests are excluded. Offline support needs HTTPS or localhost and a completed first online visit.

## Implementation

TypeScript 7, Vite 8, native ES modules, CSS cascade layers, CSS Grid, native dialogs, and the Canvas and Service Worker APIs. Express 5, Helmet, and compression serve the production bundle with a Content Security Policy and immutable hashed-asset caching. Dependencies are pinned and locked. No UI framework or external font/image requests are needed.

- `index.html`: semantic content and six panels.
- `src/style.css`: responsive layout and themes.
- `src/main.ts`: navigation, palette, preferences, session UI, and update prompts.
- `src/commands.ts`: typed command parser, completion, and dispatch.
- `src/effects.ts`: optional canvas effect and lifecycle cleanup.
- `scripts/service-worker.mjs`: dependency-free offline worker generator, connected through `vite.config.ts`.
- `public/`: original favicon, new vector icon, and web app manifest.

To deploy statically, run `npm run build` and upload `dist/` to a host at the domain root with HTTPS. Serve HTML, `sw.js`, and the manifest with revalidation; hashed `/assets/` files can be cached immutably. Navigation uses hash fragments, so no server rewrite is needed. External GitHub/CTFtime links require an internet connection.

Author: [@nodepec](https://github.com/nodepec)
