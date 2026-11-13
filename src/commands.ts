export const routes = ['profile', 'about', 'skills', 'projects', 'writeups', 'links'] as const;
export type Route = typeof routes[number];
export const themes = ['blue', 'cobalt', 'ice'] as const;
export type Theme = typeof themes[number];

export function isRoute(value: string): value is Route {
  return routes.some(route => route === value);
}

export function isTheme(value: string): value is Theme {
  return themes.some(theme => theme === value);
}

const files: Record<string, Route> = {
  'profile.md': 'profile', 'profile.txt': 'profile', 'about.md': 'about',
  'skills.json': 'skills', 'skills.txt': 'skills', 'projects.json': 'projects',
  'links.sh': 'links', 'links.txt': 'links', 'field-notes.md': 'writeups',
};

export function resolveRoute(value: string): Route | undefined {
  const clean = value.replace(/^~\/?/, '').replace(/^\.?\//, '').replace(/\/$/, '').toLowerCase();
  return isRoute(clean) ? clean : Object.hasOwn(files, clean) ? files[clean] : undefined;
}

/** Parse a small browser shell grammar. Nothing is evaluated or executed as code. */
export function tokenize(raw: string): string[] {
  const tokens: string[] = [];
  let token = '';
  let quote = '';
  let started = false;
  let escaped = false;
  for (const char of raw) {
    if (escaped) { token += char; escaped = false; started = true; continue; }
    if (char === '\\' && quote !== "'") { escaped = true; started = true; continue; }
    if (quote) {
      if (char === quote) quote = '';
      else token += char;
      continue;
    }
    if (char === '"' || char === "'") { quote = char; started = true; continue; }
    if (/\s/.test(char)) {
      if (started) { tokens.push(token); token = ''; started = false; }
    } else { token += char; started = true; }
  }
  if (quote) throw new Error('Unclosed quote. Close it and try again.');
  if (escaped) token += '\\';
  if (started) tokens.push(token);
  return tokens;
}

export function formatUptime(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const remainder = seconds % 60;
  return hours ? `${hours}h ${minutes}m ${remainder}s` : `${minutes}m ${remainder}s`;
}

export const commandDescriptions: Record<string, string> = {
  help: 'Show available commands',
  whoami: 'Show the profile',
  ls: 'List the bio files',
  cd: 'Navigate: cd projects',
  cat: 'Read a file: cat about.md',
  open: 'Open a page: open links',
  pwd: 'Show the current path',
  neofetch: 'A quick session overview',
  date: 'The current time in Perth',
  uptime: 'Time spent in this session',
  history: 'Show your command history',
  echo: 'Print text safely',
  theme: 'Set blue, cobalt, or ice',
  effects: 'Turn ambient motion on or off (Matrix stays available)',
  matrix: 'A familiar rabbit hole (Esc to exit)',
  clear: 'Clear the terminal',
  reboot: 'Replay the boot sequence',
  exit: 'Return to the boot screen',
};

type Action =
  | { type: 'navigate'; route: Route }
  | { type: 'theme'; theme: Theme }
  | { type: 'effects'; enabled: boolean }
  | { type: 'clear' | 'matrix' | 'boot' };

export interface CommandResult { text: string; error?: boolean; action?: Action }
export interface CommandContext {
  route: Route;
  theme: Theme;
  effects: boolean;
  startedAt: number;
  now: number;
  history: readonly string[];
}

export function execute(raw: string, context: CommandContext): CommandResult {
  let tokens: string[];
  try { tokens = tokenize(raw); }
  catch (error) { return { text: (error as Error).message, error: true }; }
  const [first = '', ...args] = tokens;
  const command = first.toLowerCase();
  const argument = args[0] ?? '';
  const fail = (text: string): CommandResult => ({ text, error: true });
  if (!command) return { text: '' };
  if (isRoute(command)) return { text: `Opening ${command}/`, action: { type: 'navigate', route: command } };
  switch (command) {
    case 'help': return { text: Object.entries(commandDescriptions).map(([name, description]) => `${name.padEnd(10)} ${description}`).join('\n') + '\n\n↑ ↓ history · Tab autocomplete · Ctrl/Cmd K command palette\nThis is a browser shell. Commands never run on your device.' };
    case 'whoami': return { text: 'nodepec\nCTF / web / cyber security\nPerth, Australia · learning + building' };
    case 'ls': return { text: 'profile.md  about.md  skills.json  projects/  writeups/  links.sh' };
    case 'pwd': return { text: `/home/nodepec/${context.route === 'profile' ? '' : context.route}` };
    case 'cd':
    case 'cat':
    case 'open': {
      if (args.length > 1) return fail(`Usage: ${command} <page or file>`);
      if (!argument && command !== 'cd') return fail(`Usage: ${command} <page or file>. Try ${command} about.md`);
      const route = ['', '~', '~/', '/', '..', '../'].includes(argument) ? 'profile' : argument === '.' ? context.route : resolveRoute(argument);
      return route ? { text: `Opening ${route}/`, action: { type: 'navigate', route } } : fail(`No such page: ${argument}. Type ls to see the files.`);
    }
    case 'date': return { text: new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Perth', dateStyle: 'full', timeStyle: 'long' }).format(context.now) };
    case 'uptime': return { text: formatUptime(context.now - context.startedAt) };
    case 'history': return { text: context.history.map((entry, index) => `${String(index + 1).padStart(3)}  ${entry}`).join('\n') || 'No commands yet.' };
    case 'echo': return { text: args.join(' ') };
    case 'clear': return { text: '', action: { type: 'clear' } };
    case 'theme': {
      if (!argument) return { text: `Current theme: ${context.theme}. Available: ${themes.join(', ')}.` };
      if (args.length !== 1 || !isTheme(argument)) return fail('Usage: theme blue | cobalt | ice');
      return { text: `Theme set to ${argument}.`, action: { type: 'theme', theme: argument } };
    }
    case 'effects': {
      if (!argument) return { text: `Effects are ${context.effects ? 'on' : 'off'}. Usage: effects on | off` };
      if (args.length !== 1 || !['on', 'off'].includes(argument)) return fail('Usage: effects on | off');
      return { text: `Ambient effects ${argument}. The matrix command always runs when requested.`, action: { type: 'effects', enabled: argument === 'on' } };
    }
    case 'matrix': return { text: 'Follow the white rabbit. Press Esc to return.', action: { type: 'matrix' } };
    case 'reboot':
    case 'exit': return { text: 'Starting a fresh session…', action: { type: 'boot' } };
    case 'neofetch': return { text: `     /\\_/\\       nodepec@localhost\n    = o_o =      ─────────────────\n     > ^ <       Shell: browser / no system access\n                 Theme: ${context.theme}\n                 Page: ${context.route}\n                 Uptime: ${formatUptime(context.now - context.startedAt)}\n                 Location: Perth, AU` };
    case 'ping': return { text: 'This browser shell cannot send ICMP packets. No ping was sent.\nUse the connection indicator for the browser\'s network state.' };
    default: return fail(`Command not found: ${first}. Type help for the command list.`);
  }
}

export function complete(raw: string): string[] {
  const text = raw.trimStart();
  if (!text.includes(' ')) return [...Object.keys(commandDescriptions), ...routes].filter(item => item.startsWith(text.toLowerCase()));
  const [command = '', ...rest] = text.split(' ');
  const prefix = rest.join(' ');
  let options: readonly string[] = [];
  if (['cd', 'cat', 'open'].includes(command)) options = [...routes, ...Object.keys(files)];
  else if (command === 'theme') options = themes;
  else if (command === 'effects') options = ['on', 'off'];
  return options.filter(item => item.startsWith(prefix)).map(item => `${command} ${item}`);
}
