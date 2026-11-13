import { commandDescriptions, complete, execute, formatUptime, isRoute, isTheme, routes, themes } from './commands.ts';
import type { Route, Theme } from './commands.ts';
import { createMatrix } from './effects.ts';

const $ = <T extends HTMLElement>(selector: string) => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing UI element: ${selector}`);
  return element;
};
const root = document.documentElement;
const input = $<HTMLInputElement>('#command-input');
const log = $('#console-log');
const palette = $<HTMLDialogElement>('#palette');
const search = $<HTMLInputElement>('#palette-search');
const results = $('#palette-results');
const boot = $<HTMLDialogElement>('#boot');
const startedAt = Date.now();
const history: string[] = [];
let historyIndex = 0;
let draft = '';
let route: Route = 'profile';
let theme: Theme = 'blue';
let effects = true;
let toastTimeout: ReturnType<typeof setTimeout>;
let bootTimers: ReturnType<typeof setTimeout>[] = [];

// Preferences remain local and the site still works when storage is blocked.
function readPreference(key: string): string | null {
  try { return localStorage.getItem(`nodepec:${key}`); } catch { return null; }
}
function savePreference(key: string, value: string) {
  try { localStorage.setItem(`nodepec:${key}`, value); } catch { /* Session-only preference. */ }
}

function toast(message: string) {
  const element = $('#toast');
  clearTimeout(toastTimeout);
  element.textContent = message;
  element.hidden = false;
  toastTimeout = setTimeout(() => { element.hidden = true; }, 3500);
}

function setTheme(value: Theme) {
  theme = value;
  root.dataset.theme = value;
  $('#theme-label').textContent = value;
  savePreference('theme', value);
}

const matrix = createMatrix($<HTMLCanvasElement>('#matrix-canvas'), () => {});

function setEffects(value: boolean) {
  effects = value;
  root.dataset.motion = value ? 'on' : 'off';
  $('#motion-label').textContent = value ? 'on' : 'off';
  $('#motion-trigger').setAttribute('aria-pressed', String(value));
  if (!value) matrix.stop();
  savePreference('effects', String(value));
}

function navigate(next: Route, updateHash = true) {
  const changed = route !== next;
  route = next;
  document.querySelectorAll<HTMLElement>('[data-route]').forEach(element => {
    const active = element.dataset.route === next;
    element.classList.toggle('active', active);
    if (element.getAttribute('role') === 'tab') {
      element.setAttribute('aria-selected', String(active));
      element.tabIndex = active ? 0 : -1;
    } else if (active) element.setAttribute('aria-current', 'page');
    else element.removeAttribute('aria-current');
  });
  routes.forEach(name => {
    const page = $(`#${name}`);
    page.hidden = name !== next;
    page.classList.toggle('active', name === next);
  });
  $('#command-path').textContent = next === 'profile' ? '~' : `~/${next}`;
  document.title = `nodepec — ${next} / session://bio`;
  if (updateHash && location.hash !== `#${next}`) window.history.pushState(null, '', `#${next}`);
  if (changed) $('#workspace').scrollTop = 0;
}

function routeFromHash() {
  const value = location.hash.slice(1);
  if (isRoute(value)) navigate(value, false);
  else if (!value) navigate('profile', false);
}

function appendResult(command: string, text: string, error = false) {
  const entry = document.createElement('div');
  entry.className = 'command-entry';
  const echo = document.createElement('div');
  echo.className = 'command-echo';
  echo.textContent = `guest:~$ ${command}`;
  const output = document.createElement('pre');
  output.className = `command-result${error ? ' error' : ''}`;
  output.textContent = text;
  entry.append(echo, output);
  log.append(entry);
  // Bound the DOM as well as command history during long sessions.
  while (log.children.length > 60) log.firstElementChild?.remove();
  log.scrollTop = log.scrollHeight;
}

function run(raw: string) {
  const command = raw.trim().slice(0, 500);
  if (!command) return;
  if (history.at(-1) !== command) history.push(command);
  if (history.length > 100) history.shift();
  historyIndex = history.length;
  draft = '';
  const result = execute(command, { route, theme, effects, startedAt, now: Date.now(), history });
  if (result.action?.type === 'clear') { log.replaceChildren(); return; }
  appendResult(command, result.text, result.error);
  const action = result.action;
  if (!action) return;
  switch (action.type) {
    case 'navigate': navigate(action.route); break;
    case 'theme': setTheme(action.theme); break;
    case 'effects': setEffects(action.enabled); break;
    case 'boot': showBoot(); break;
    case 'matrix': if (!matrix.start()) toast('Matrix is paused. Enable effects and turn off reduced motion to play it.'); break;
  }
}

document.addEventListener('click', event => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest<HTMLAnchorElement>('[data-route]');
  if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    const next = link.dataset.route ?? '';
    if (isRoute(next)) { event.preventDefault(); navigate(next); }
  }
  const command = target.closest<HTMLElement>('[data-command]')?.dataset.command;
  if (command) { run(command); input.focus({ preventScroll: true }); }
});

$('.tabs').addEventListener('keydown', event => {
  if (!(event instanceof KeyboardEvent)) return;
  const current = routes.indexOf(route);
  let next = current;
  if (event.key === 'ArrowRight') next = (current + 1) % routes.length;
  else if (event.key === 'ArrowLeft') next = (current + routes.length - 1) % routes.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = routes.length - 1;
  else return;
  event.preventDefault();
  const name = routes[next]!;
  navigate(name);
  $(`#tab-${name}`).focus();
});
window.addEventListener('hashchange', routeFromHash);
window.addEventListener('popstate', routeFromHash);
$('#command-form').addEventListener('submit', event => { event.preventDefault(); const raw = input.value; input.value = ''; run(raw); });
$('#clear-console').addEventListener('click', () => { log.replaceChildren(); input.focus(); });

input.addEventListener('keydown', event => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    if (historyIndex === history.length) draft = input.value;
    historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
    input.value = historyIndex === history.length ? draft : history[historyIndex] ?? '';
    input.setSelectionRange(input.value.length, input.value.length);
  } else if (event.key === 'Tab' && !event.shiftKey && input.value.trim()) {
    const matches = complete(input.value);
    if (matches.length) {
      event.preventDefault();
      if (matches.length === 1) input.value = `${matches[0]} `;
      else appendResult(input.value, matches.join('  '));
    }
  } else if (event.key === 'Escape') { input.value = ''; input.blur(); }
  else if ((event.ctrlKey || event.metaKey) && event.key === 'l') { event.preventDefault(); log.replaceChildren(); }
});

$('#theme-trigger').addEventListener('click', () => { setTheme(themes[(themes.indexOf(theme) + 1) % themes.length]!); toast(`Theme: ${theme}`); });
$('#motion-trigger').addEventListener('click', () => { setEffects(!effects); toast(`Effects ${effects ? 'on' : 'off'}`); });
$('#copy-handle').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('@nodepec'); toast('Copied @nodepec'); }
  catch { toast('Copy this handle: @nodepec'); }
});

function closeBoot() { boot.close(); }
function showBoot() {
  matrix.stop();
  if (palette.open) palette.close();
  if (boot.open) return;
  bootTimers.forEach(clearTimeout);
  const lines = $('#boot-lines');
  lines.replaceChildren();
  boot.showModal();
  const messages = ['session://bio', 'mounting ~/nodepec', 'loading profile + projects', 'shell ready', 'welcome back.'];
  const reduced = !effects || matchMedia('(prefers-reduced-motion: reduce)').matches;
  bootTimers = messages.map((message, index) => setTimeout(() => {
    const line = document.createElement('p');
    line.textContent = message;
    lines.append(line);
  }, reduced ? 0 : index * 190));
}
$('#boot-trigger').addEventListener('click', showBoot);
$('#boot-close').addEventListener('click', closeBoot);
$('#boot-enter').addEventListener('click', closeBoot);
boot.addEventListener('close', () => { bootTimers.forEach(clearTimeout); input.focus({ preventScroll: true }); });
boot.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); closeBoot(); } });

interface PaletteItem { title: string; detail: string; keywords: string; select: () => void }
const paletteItems: PaletteItem[] = [
  ...routes.map(name => ({ title: `Open ${name}`, detail: 'page', keywords: name, select: () => { navigate(name); $(`#${name}`).focus({ preventScroll: true }); } })),
  ...Object.entries(commandDescriptions).filter(([name]) => !['cd', 'cat', 'open', 'echo'].includes(name)).map(([name, description]) => ({ title: name, detail: description, keywords: `${name} ${description}`, select: () => { run(name); if (!boot.open && $('#matrix-overlay').hidden) input.focus({ preventScroll: true }); } })),
  ...themes.map(value => ({ title: `Theme: ${value}`, detail: 'appearance', keywords: `theme ${value}`, select: () => setTheme(value) })),
  { title: 'Toggle effects', detail: 'accessibility', keywords: 'motion animation effects', select: () => setEffects(!effects) },
];
let filteredItems: PaletteItem[] = [];
let selectedIndex = 0;
results.setAttribute('role', 'listbox');
search.setAttribute('role', 'combobox');
search.setAttribute('aria-expanded', 'true');
search.setAttribute('aria-autocomplete', 'list');

function highlightResult() {
  results.querySelectorAll<HTMLButtonElement>('.palette-result').forEach((button, index) => {
    button.classList.toggle('selected', index === selectedIndex);
    button.setAttribute('aria-selected', String(index === selectedIndex));
  });
  const active = document.getElementById(`palette-item-${selectedIndex}`);
  if (active) { search.setAttribute('aria-activedescendant', active.id); active.scrollIntoView({ block: 'nearest' }); }
  else search.removeAttribute('aria-activedescendant');
}

function renderPalette() {
  const query = search.value.trim().toLowerCase();
  filteredItems = paletteItems.filter(item => `${item.title} ${item.keywords}`.toLowerCase().includes(query));
  selectedIndex = 0;
  results.replaceChildren();
  filteredItems.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'palette-result';
    button.id = `palette-item-${index}`;
    button.setAttribute('role', 'option');
    button.tabIndex = -1;
    const title = document.createElement('span');
    title.textContent = item.title;
    const detail = document.createElement('small');
    detail.textContent = item.detail;
    button.append(title, detail);
    button.addEventListener('click', () => { palette.close(); item.select(); });
    results.append(button);
  });
  if (!filteredItems.length) { const empty = document.createElement('p'); empty.className = 'palette-empty'; empty.textContent = 'No matches. Try a page name or “theme”.'; results.append(empty); }
  highlightResult();
}
function openPalette() {
  if (boot.open || !$('#matrix-overlay').hidden) return;
  search.value = '';
  palette.showModal();
  renderPalette();
  search.focus();
}
$('#palette-trigger').addEventListener('click', openPalette);
$('#palette-close').addEventListener('click', () => palette.close());
search.addEventListener('input', renderPalette);
search.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    if (!filteredItems.length) return;
    selectedIndex = (selectedIndex + (event.key === 'ArrowDown' ? 1 : -1) + filteredItems.length) % filteredItems.length;
    highlightResult();
  } else if (event.key === 'Enter') { event.preventDefault(); const item = filteredItems[selectedIndex]; if (item) { palette.close(); item.select(); } }
});
palette.addEventListener('click', event => { if (event.target === palette) { const rect = palette.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) palette.close(); } });
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (palette.open) palette.close(); else openPalette(); }
});

// The original secret still has a home. The key that opens it never closes it.
const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let sequenceIndex = 0;
document.addEventListener('keydown', event => {
  if (palette.open || boot.open || event.target instanceof HTMLInputElement) return;
  sequenceIndex = event.key === konami[sequenceIndex] ? sequenceIndex + 1 : event.key === konami[0] ? 1 : 0;
  if (sequenceIndex === konami.length) { sequenceIndex = 0; toast('ACCESS GRANTED · you found the easter egg. gg'); }
});

function updateStatus() {
  $('#session-uptime').textContent = `session ${formatUptime(Date.now() - startedAt)}`;
  $('#perth-time').textContent = `${new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Perth', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())} Perth`;
  $('#connection-status').textContent = navigator.onLine ? 'online' : 'offline';
}
window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);
let statusTimer: ReturnType<typeof setInterval> | undefined;
function syncStatusTimer() {
  clearInterval(statusTimer);
  if (!document.hidden) { updateStatus(); statusTimer = setInterval(updateStatus, 1000); }
}
document.addEventListener('visibilitychange', syncStatusTimer);

const savedTheme = readPreference('theme');
setTheme(savedTheme && isTheme(savedTheme) ? savedTheme : 'blue');
setEffects(readPreference('effects') !== 'false');
root.classList.add('js');
routeFromHash();
navigate(route, false);
syncStatusTimer();

// Production precaches the built, hashed assets. Updates wait for the visitor.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  let registration: ServiceWorkerRegistration | undefined;
  let refreshRequested = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshRequested) location.reload(); });
  void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(value => {
    registration = value;
    if (value.waiting) $('#update-notice').hidden = false;
    value.addEventListener('updatefound', () => {
      const installing = value.installing;
      installing?.addEventListener('statechange', () => {
        if (installing.state !== 'installed') return;
        if (navigator.serviceWorker.controller) $('#update-notice').hidden = false;
        else toast('cached for offline use.');
      });
    });
  }).catch((error: unknown) => { console.warn('Offline mode could not be registered.', error); });
  $('#update-apply').addEventListener('click', () => {
    if (!registration?.waiting) { location.reload(); return; }
    refreshRequested = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  });
  $('#update-dismiss').addEventListener('click', () => { $('#update-notice').hidden = true; });
}
