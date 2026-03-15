const HACKER_CAT = '     welcome!\n    /\\_/\\           ___\n   = o_o =_______    \\ \\ \n    __^      __(  \\.__) )\n(@)<_____>__(_____)____/';

const TABS = ['profile','about','skills','projects','writeups','links'];

const CONTENT = {
  profile:  'Name:       [REDACTED]\nHandle:     @nodepec\nFocus:      CTF / web / cyber security\nLocation:   Perth, AU\nStatus:     learning + building\n\nNotes:\n- I participate in ctf events every now and then\n- I keep solutions to the main challenges\n- I dont like boring stuff',
  about:    'I like difficult challenges that make me think\nsmall hypotheses -> quick tests -> record -> refine\n\nI\'m most interested in:\n- web apps\n- cryptography\n- open source intelligence',
  skills:   'Coding:\n- JavaScript, Python, Html, Css\n\nCTF / security:\n- web fundamentals, auth flows, input handling mindset\n- writeups: assumptions -> tests -> evidence -> lesson\n\nTools:\n- Burp (learning), Wireshark (also learning), Ghidra (ultra noob)',
  projects: 'https://nodepec.github.io/The-Challenges/\n\nThis is my self made ctf challenges that use ai to adapt my\nencryption methods into an interactive story that makes you\nfeel like it is something meaningful',
  writeups: '[placeholder] lorem ipsum dolor sit amet\n[placeholder] lorem ipsum dolor sit amet\n[placeholder] lorem ipsum dolor sit amet',
};

const LINKS = [
  { href: 'https://github.com/nodepec',      label: 'github://nodepec' },
  { href: 'https://ctftime.org/team/402033', label: 'ctftime://team'   },
];

const CMD_MAP  = { profile:'cat profile.txt', about:'cat about.md', skills:'cat skills.txt', projects:'cat projects.json', writeups:'tail -n 3 latest.log', links:'cat links.txt' };
const PATH_MAP = { profile:'~/bio', about:'~/bio/about', skills:'~/bio/skills', projects:'~/bio/projects', writeups:'~/bio/writeups', links:'~/bio/links' };

const SC   = '!<>-_\\/[]{}=+*^?#________';
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function scramble(el, final) {
  if (!el || el._sc) return;
  const old = el.innerText || '';
  const len = Math.max(old.length, final.length);
  const q   = [];
  for (let i = 0; i < len; i++) {
    const s = rand(0, 39);
    q.push({ from: old[i] || '', to: final[i] || '', start: s, end: s + rand(0, 39), char: '' });
  }
  el._sc = true;
  let f = 0;
  const run = () => {
    let out = '', done = 0;
    for (let i = 0; i < q.length; i++) {
      const e = q[i];
      if      (f >= e.end)   { done++; out += e.to; }
      else if (f >= e.start) { if (!e.char || Math.random() < .28) e.char = SC[rand(0, SC.length - 1)]; out += '<span class="dud">' + e.char + '</span>'; }
      else                   { out += e.from; }
    }
    el.innerHTML = out;
    if (done === q.length) { el._sc = false; el.innerHTML = final; }
    else { f++; requestAnimationFrame(run); }
  };
  run();
}

document.querySelectorAll('.key').forEach(k => {
  k.addEventListener('mouseenter', () => scramble(k, k.innerText));
});

document.getElementById('ascii-art').textContent = HACKER_CAT;

const tabsRow  = document.getElementById('tabs-row');
const viewport = document.getElementById('viewport');

TABS.forEach(t => {
  const btn = document.createElement('button');
  btn.className   = 'tab-btn' + (t === 'profile' ? ' active' : '');
  btn.role        = 'tab';
  btn.dataset.tab = t;
  btn.textContent = t;
  btn.addEventListener('mouseenter', () => scramble(btn, t));
  tabsRow.appendChild(btn);

  const page    = document.createElement('div');
  page.className = 'page' + (t === 'profile' ? ' active' : '');
  page.id        = 'page-' + t;
  page.role      = 'tabpanel';

  const pl = document.createElement('div');
  pl.className = 'prompt-line';
  pl.innerHTML = '<span class="p-host">user@host</span><span class="p-dim">:</span><span class="p-path">' + PATH_MAP[t] + '</span><span class="p-dim">$ </span><span class="p-cmd">' + CMD_MAP[t] + '</span>';
  page.appendChild(pl);

  if (t === 'links') {
    const lp = document.createElement('div');
    lp.className = 'links-panel';
    LINKS.forEach(l => {
      const a     = document.createElement('a');
      a.className = 'link-item';
      a.href      = l.href;
      a.target    = '_blank';
      a.rel       = 'noreferrer';
      a.textContent = l.label;
      a.addEventListener('mouseenter', () => scramble(a, l.label));
      lp.appendChild(a);
    });
    page.appendChild(lp);
  } else {
    const pre     = document.createElement('pre');
    pre.className = 'panel';
    pre.textContent = CONTENT[t];
    page.appendChild(pre);
  }

  if (t === 'profile') {
    const hint    = document.createElement('div');
    hint.className = 'kbd-hint';
    hint.innerHTML = 'Tip: use <kbd class="key">&larr;</kbd>/<kbd class="key">&rarr;</kbd> to switch tabs';
    hint.querySelectorAll('.key').forEach(k => k.addEventListener('mouseenter', () => scramble(k, k.innerText)));
    page.appendChild(hint);
  }

  viewport.appendChild(page);
});

let activeTab = 'profile';

function setTab(name) {
  activeTab = name;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + name));
  const page = document.getElementById('page-' + name);
  if (page) {
    scramble(page.querySelector('.p-host'), 'user@host');
    scramble(page.querySelector('.p-cmd'),  CMD_MAP[name]);
  }
}

tabsRow.addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (btn) setTab(btn.dataset.tab);
});

const bootScreen = document.getElementById('boot-screen');
const bioScreen  = document.getElementById('bio-screen');

function showBio() {
  bootScreen.classList.add('screen-off');
  bioScreen.classList.remove('screen-off');
  document.getElementById('terminal').focus();
  scramble(document.getElementById('bio-host'), 'user@host');
}

function showBoot() {
  bioScreen.classList.add('screen-off');
  bootScreen.classList.remove('screen-off');
  document.getElementById('terminal').focus();
}

window.addEventListener('keydown', e => {
  const onBoot = !bootScreen.classList.contains('screen-off');
  if (onBoot) {
    if (e.key === 'Enter') {
      scramble(document.getElementById('enter-key'), 'Enter');
      setTimeout(showBio, 100);
    }
    return;
  }
  const idx = TABS.indexOf(activeTab);
  if      (e.key === 'ArrowRight') setTab(TABS[(idx + 1) % TABS.length]);
  else if (e.key === 'ArrowLeft')  setTab(TABS[(idx - 1 + TABS.length) % TABS.length]);
  else if (e.key === 'Escape')     showBoot();
});

document.getElementById('terminal').addEventListener('click', () => document.getElementById('terminal').focus());

const titleEl = document.getElementById('title-text');
titleEl.addEventListener('mouseenter', () => scramble(titleEl, 'session://bio'));

function scheduleScramble() {
  setTimeout(() => {
    const onBoot = !bootScreen.classList.contains('screen-off');
    if (onBoot) {
      const ids = ['bv-ip', 'bv-sys', 'bv-up'];
      const el  = document.getElementById(ids[rand(0, 2)]);
      if (el && !el._sc && el.textContent && el.textContent !== 'resolving...' && el.textContent !== 'loading...') {
        scramble(el, el.textContent);
      }
    } else {
      const pool = Array.from(document.querySelectorAll('.page.active .p-host, .page.active .p-cmd, .page.active .p-path, .title-text')).filter(el => !el._sc && el.innerText && el.innerText.trim());
      if (pool.length) {
        const el = pool[rand(0, pool.length - 1)];
        scramble(el, el.innerText);
      }
    }
    scheduleScramble();
  }, rand(5000, 7000));
}
scheduleScramble();

const startedAt = Date.now();
const fmt = ms => { const m = Math.floor(ms / 60000), h = Math.floor(m / 60); return h > 0 ? (h + 'h ' + (m % 60) + 'm') : (m + 'm'); };

async function detectClient() {
  const ua = navigator.userAgent || '';
  let os = 'unknown';
  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
    try {
      const d = await navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion']);
      if      (d.platform === 'Windows')  os = parseInt(d.platformVersion, 10) >= 13 ? 'Windows 11' : 'Windows 10';
      else if (d.platform === 'macOS')    os = 'macOS';
      else if (d.platform === 'Android')  os = 'Android';
      else if (d.platform === 'iOS')      os = 'iOS';
      else if (d.platform === 'Linux')    os = 'Linux';
    } catch(e) {}
  }
  if (os === 'unknown') {
    if      (/Windows NT/.test(ua))        os = 'Windows';
    else if (/Mac OS X/.test(ua))          os = 'macOS';
    else if (/Android/.test(ua))           os = 'Android';
    else if (/iPhone|iPad|iPod/.test(ua))  os = 'iOS';
    else if (/Linux/.test(ua))             os = 'Linux';
  }
  let b = 'unknown';
  if      (/Edg\//.test(ua))                             b = 'Edge';
  else if (/Chrome\//.test(ua))                          b = 'Chrome';
  else if (/Firefox\//.test(ua))                         b = 'Firefox';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) b = 'Safari';
  return os === 'unknown' ? b : (os + ' (' + b + ')');
}

(async () => {
  const [ip, sys] = await Promise.all([
    fetch('https://api.ipify.org?format=json', { cache: 'no-store' }).then(r => r.json()).then(d => d.ip || 'unknown').catch(() => 'unknown'),
    detectClient(),
  ]);
  const ipEl  = document.getElementById('bv-ip');
  const sysEl = document.getElementById('bv-sys');
  const upEl  = document.getElementById('bv-up');
  scramble(ipEl,  ip);
  scramble(sysEl, sys);
  scramble(upEl,  fmt(Date.now() - startedAt));
  setInterval(() => { if (upEl && !upEl._sc) upEl.textContent = fmt(Date.now() - startedAt); }, 30000);
})();

(function() {
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');
  const shell  = document.getElementById('shell');
  const C = { count:110, size:2, speed:.35, lifetime:220, rr:90, rf:.18, bc:18, bs:3.2, op:.5 };
  const r2 = C.rr * C.rr, PAD = 14;
  let tr = { l:0, t:0, r:0, b:0 }, W = 0, H = 0;

  const inT = (x, y) => x >= tr.l && x <= tr.r && y >= tr.t && y <= tr.b;

  function rsz() {
    W = canvas.offsetWidth; H = canvas.offsetHeight; canvas.width = W; canvas.height = H;
    const cr = canvas.getBoundingClientRect(), s = shell.getBoundingClientRect();
    tr = { l: s.left - cr.left - PAD, t: s.top - cr.top - PAD, r: s.right - cr.left + PAD, b: s.bottom - cr.top + PAD };
  }

  function mp(burst, bx, by) {
    burst = !!burst; bx = bx || 0; by = by || 0;
    const a = Math.random() * Math.PI * 2;
    const spd = burst ? C.bs * (0.5 + Math.random()) : C.speed * (0.4 + Math.random() * 0.8);
    let x, y;
    if (burst) { x = bx; y = by; } else { do { x = Math.random() * W; y = Math.random() * H; } while (inT(x, y)); }
    return { x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, phase: Math.random() * Math.PI * 2, life: burst ? 0 : Math.floor(Math.random() * C.lifetime), maxLife: C.lifetime + Math.floor(Math.random() * 80 - 40), burst };
  }

  const ps    = Array.from({ length: C.count }, () => mp());
  const mouse = { x: -9999, y: -9999 };
  let fc = 0;

  window.addEventListener('mousemove',  e  => { const cr = canvas.getBoundingClientRect(); mouse.x = e.clientX - cr.left; mouse.y = e.clientY - cr.top; }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; }, { passive: true });
  window.addEventListener('click', e => { const cr = canvas.getBoundingClientRect(), x = e.clientX - cr.left, y = e.clientY - cr.top; if (inT(x, y)) return; for (let i = 0; i < C.bc; i++) ps.push(mp(true, x, y)); });
  window.addEventListener('resize', rsz, { passive: true });
  rsz();

  (function tick() {
    requestAnimationFrame(tick); fc++;
    ctx.clearRect(0, 0, W, H);
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i]; p.life++;
      let a;
      if      (p.life < 20)               a = (p.life / 20) * C.op;
      else if (p.life > p.maxLife - 40)   a = ((p.maxLife - p.life) / 40) * C.op;
      else                                a = C.op;
      if (p.life >= p.maxLife) { if (p.burst) { ps.splice(i, 1); continue; } Object.assign(p, mp()); continue; }
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < r2 && d2 > 0) { const d = Math.sqrt(d2), f = C.rf * (1 - d / C.rr); p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      p.vx *= .97; p.vy *= .97;
      if (!p.burst) { p.vx += Math.sin(p.phase + fc * .012) * .008; p.vy += Math.cos(p.phase + fc * .009) * .008; }
      p.x += p.vx; p.y += p.vy;
      const buf = 4;
      if (p.x < -buf) p.x = W + buf; if (p.x > W + buf) p.x = -buf;
      if (p.y < -buf) p.y = H + buf; if (p.y > H + buf) p.y = -buf;
      if (inT(p.x, p.y)) continue;
      ctx.globalAlpha = Math.max(0, Math.min(1, a)); ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(p.x), Math.round(p.y), C.size, C.size);
    }
    while (ps.filter(p => !p.burst).length < C.count) ps.push(mp());
    ctx.globalAlpha = 1;
  })();
})();
