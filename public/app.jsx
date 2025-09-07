const { useEffect, useMemo, useRef, useState } = React;

function useTheme(){
  const KEY = 'bio-theme';
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY) || 'system');

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', dark);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return { theme, setTheme };
}

function useClock(tz = 'Australia/Perth'){
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(now);
}

const Icon = {
  YT:(p)=>(<svg viewBox="0 0 24 24" {...p}><path fill="currentColor" d="M23.5 6.2a4 4 0 0 0-2.8-2.8C18.9 3 12 3 12 3s-6.9 0-8.7.4A4 4 0 0 0 .5 6.2 41 41 0 0 0 0 12c0 1.9.1 3.8.5 5.8a4 4 0 0 0 2.8 2.8C5.1 21 12 21 12 21s6.9 0 8.7-.4a4 4 0 0 0 2.8-2.8c.3-2 .5-3.9.5-5.8s-.2-3.8-.5-5.8zM9.8 15.5V8.5L16 12l-6.2 3.5z"/></svg>),
  GH:(p)=>(<svg viewBox="0 0 24 24" {...p}><path fill="currentColor" d="M12 .5A11.5 11.5 0 0 0 .4 12.2a11.7 11.7 0 0 0 7.8 11c.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.8 2.8 1.2 3.5.9a2.7 2.7 0 0 1 .8-1.7c-2.6-.3-5.3-1.3-5.3-5.9a4.7 4.7 0 0 1 1.3-3.2 4.3 4.3 0 0 1 .1-3.1s1-.3 3.2 1.2a11.2 11.2 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2a4.3 4.3 0 0 1 .1 3.1 4.7 4.7 0 0 1 1.3 3.2c0 4.6-2.8 5.6-5.4 5.9.4.3.9 1 .9 2v3c0 .3.2.6.8.5A11.7 11.7 0 0 0 23.6 12 11.5 11.5 0 0 0 12 .5z"/></svg>),
  Ext:(p)=>(<svg viewBox="0 0 24 24" {...p}><path fill="currentColor" d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>),
};

const LINKS = [
  { title:'YouTube', href:'https://www.youtube.com/@yense7en/', desc:'My YouTube', icon:'YT' },
  { title:'GitHub',  href:'https://github.com/nodepec',           desc:'Projects',   icon:'GH' },
  { title:'Repos',   href:'https://github.com/nodepec?tab=repositories', desc:'All repos', icon:'Ext' }
];

function LinkTile({ title, desc, href, icon: key, clicks, onClick }){
  const Svg = Icon[key];
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={onClick}
       className="group relative block rounded-xl border border-white/10 bg-white/50 p-4 shadow-soft backdrop-blur-sm transition-all hover:-translate-y-0.5 dark:bg-neutral-900/50">
      <div className="flex items-center gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-lg text-white shadow bg-gradient-to-br from-indigo-500 to-violet-500">
          <Svg className="h-5 w-5"/>
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{title}</h3>
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">{desc}</p>
        </div>
        <Icon.Ext className="ml-auto h-5 w-5 text-neutral-500 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-neutral-300"/>
      </div>
      {typeof clicks === 'number' && (
        <span className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 ring-1 ring-black/5 backdrop-blur-sm dark:bg-neutral-800/70 dark:text-neutral-200 dark:ring-white/10">{clicks} visits</span>
      )}
    </a>
  );
}

function App(){
  const { theme, setTheme } = useTheme();
  const time = useClock('Australia/Perth');

  const [links, setLinks] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('linkClicks') || '{}');
    return LINKS.map(l => ({ ...l, clicks: saved[l.href] || 0 }));
  });
  const addClick = (href) => {
    setLinks(prev => {
      const next = prev.map(l => l.href === href ? { ...l, clicks: (l.clicks || 0) + 1 } : l);
      const map = {}; next.forEach(l => { map[l.href] = l.clicks || 0; });
      localStorage.setItem('linkClicks', JSON.stringify(map));
      return next;
    });
  };

  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-4">
          <img src="./avatar.png" alt="avatar" className="h-14 w-14 rounded-full border border-white/20 object-cover shadow"/>
          <div>
            <h1 className="text-2xl font-bold">n33t</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://github.com/nodepec/bio-website" className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow hover:opacity-95 bg-gradient-to-r from-indigo-500 to-violet-500">
            {React.createElement(Icon.GH,{className:'h-4 w-4'})} <span className="hidden sm:inline">Source</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="mt-10 grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-white/10 bg-white/50 p-6 shadow-soft backdrop-blur-sm dark:bg-neutral-900/50">
            <h2 className="text-3xl font-bold">Hey, I’m <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">n33t</span></h2>
            <p className="mt-3 text-neutral-700 dark:text-neutral-200">I build small projects and try out different languages. Here are a few places to find me.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/60 px-3 py-1.5 text-sm text-neutral-700 shadow-sm backdrop-blur-sm dark:bg-neutral-800/60 dark:text-neutral-200">
                AWST <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> {time}
              </span>
            </div>
          </div>

          <aside className="rounded-xl border border-white/10 bg-white/50 p-6 shadow-soft backdrop-blur-sm dark:bg-neutral-900/50">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">Quick stats</h3>
            <ul className="mt-3 grid grid-cols-2 gap-3 text-sm text-neutral-700 dark:text-neutral-200">
              {[
                ['Years coding','2'],
                ['Fav stack','React + Tailwind'],
                ['Timezone','AWST'],
                ['Open to','Collabs']
              ].map(([k,v]) => (
                <li key={k} className="rounded-lg bg-white/60 p-3 text-center shadow ring-1 ring-black/5 dark:bg-neutral-800/60 dark:ring-white/10">
                  <div className="text-xs uppercase text-neutral-500 dark:text-neutral-400">{k}</div>
                  <div className="mt-1 text-lg font-semibold">{v}</div>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(l => <LinkTile key={l.href} {...l} onClick={() => addClick(l.href)} />)}
        </section>

        <section className="mt-8">
          <div className="rounded-xl border border-white/10 bg-white/50 p-6 shadow-soft backdrop-blur-sm dark:bg-neutral-900/50">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">About</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-200">This is a small page that is kind of like a bio i guess</p>
          </div>
        </section>
      </main>

      <footer className="mx-auto my-12 max-w-6xl px-6 text-sm text-neutral-600 dark:text-neutral-300">
        <p>© {new Date().getFullYear()} n33t</p>
      </footer>

    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
