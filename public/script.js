const terminal  = document.getElementById("terminal");
const boot      = document.getElementById("boot");
const bio       = document.getElementById("bio");
const elIp      = document.getElementById("bio-ip");
const elSystem  = document.getElementById("bio-system");
const elUptime  = document.getElementById("bio-uptime");
const asciiEl   = document.getElementById("ascii-logo");
const tabs      = Array.from(document.querySelectorAll(".tab"));
const pages     = Array.from(document.querySelectorAll(".page"));
const startedAt = Date.now();

const HACKER_CAT = String.raw`
     welcome!
    /\_/\           ___
   = o_o =_______    \ \ 
    __^      __(  \.__) )
(@)<_____>__(_____)____/
`;

function safeText(el, value) {
  if (el) el.textContent = value ?? "unknown";
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function startUptimeTick() {
  const el = document.getElementById("bio-uptime");
  if (!el) return;
  setInterval(() => {
    if (!el._scrambling) el.textContent = formatUptime(Date.now() - startedAt);
  }, 1000);
}

async function detectClient() {
  const ua = navigator.userAgent || "";
  let os = "unknown";
  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      const { platform, platformVersion } = await navigator.userAgentData.getHighEntropyValues(["platform", "platformVersion"]);
      if (platform === "Windows")      os = parseInt(platformVersion, 10) >= 13 ? "Windows 11" : "Windows 10";
      else if (platform === "macOS")   os = "macOS";
      else if (platform === "Android") os = "Android";
      else if (platform === "iOS")     os = "iOS";
      else if (platform === "Linux")   os = "Linux";
    } catch {}
  }
  if (os === "unknown") {
    if (/Windows NT/.test(ua))            os = "Windows";
    else if (/Mac OS X/.test(ua))         os = "macOS";
    else if (/Android/.test(ua))          os = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
    else if (/Linux/.test(ua))            os = "Linux";
  }
  let browser = "unknown";
  if (/Edg\//.test(ua))                                  browser = "Edge";
  else if (/Chrome\//.test(ua))                          browser = "Chrome";
  else if (/Firefox\//.test(ua))                         browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = "Safari";
  return os === "unknown" ? browser : `${os} (${browser})`;
}

async function getPublicIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    if (!res.ok) throw new Error();
    const { ip } = await res.json();
    return ip || "unknown";
  } catch {
    return "unknown";
  }
}

async function fillBoot() {
  if (asciiEl) asciiEl.textContent = HACKER_CAT.trimEnd();

  const container = document.getElementById("boot-lines");
  const hint      = document.getElementById("boot-hint");

  function addLine(html, delay, extraClass) {
    return sleep(delay).then(() => {
      const div = document.createElement("div");
      div.className = "boot-line" + (extraClass ? " " + extraClass : "");
      div.innerHTML = html;
      container.appendChild(div);
      requestAnimationFrame(() => requestAnimationFrame(() => div.classList.add("show")));
    });
  }

  await addLine('<span class="ok">[OK]</span> <span class="label">init</span> system boot sequence', 120);
  await addLine('<span class="ok">[OK]</span> <span class="label">load</span> kernel modules', 220);

  const [ip, system] = await Promise.all([getPublicIP(), detectClient()]);

  await addLine(`<span class="ok">[OK]</span> <span class="label">net</span> interface up`, 180);
  await addLine(`<span class="ok">[OK]</span> <span class="label">IP</span> <span id="bio-ip">${ip}</span>`, 140);
  await addLine(`<span class="ok">[OK]</span> <span class="label">sys</span> <span id="bio-system">${system}</span>`, 160);
  await addLine(`<span class="ok">[OK]</span> <span class="label">uptime</span> <span id="bio-uptime">${formatUptime(Date.now() - startedAt)}</span>`, 120);

  await sleep(220);
  await addLine('<span style="color:rgba(233,233,233,.9)">Bio Loaded</span>', 0, 'bio-loaded');

  await sleep(300);
  hint.style.display = "";
  requestAnimationFrame(() => requestAnimationFrame(() => hint.classList.add("show")));

  startUptimeTick();
}

function showBio() {
  boot.classList.add("hidden");
  bio.classList.remove("hidden");
  terminal.focus({ preventScroll: true });
  document.getElementById("cmd-input")?.focus();
}

function showBoot() {
  bio.classList.add("hidden");
  boot.classList.remove("hidden");
  terminal.focus({ preventScroll: true });
  stopMatrix();
}

function setActivePage(name) {
  for (const t of tabs) {
    const active = t.dataset.page === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", String(active));
  }
  for (const p of pages) p.classList.toggle("active", p.dataset.page === name);
  typePanel(name);
}

function nextTab(dir) {
  const idx = Math.max(0, tabs.findIndex(t => t.classList.contains("active")));
  setActivePage(tabs[(idx + dir + tabs.length) % tabs.length].dataset.page);
}

tabs.forEach(btn => btn.addEventListener("click", () => setActivePage(btn.dataset.page)));

const panelOriginals = {};
let typingRaf = null;

function typePanel(name) {
  const panel = document.getElementById(`panel-${name}`);
  if (!panel) return;

  if (!panelOriginals[name]) {
    panelOriginals[name] = panel.textContent;
  }

  cancelAnimationFrame(typingRaf);
  const full   = panelOriginals[name];
  const speed  = 8;
  let   pos    = 0;
  panel.textContent = "";

  const tick = () => {
    pos = Math.min(pos + speed, full.length);
    panel.textContent = full.slice(0, pos);
    if (pos < full.length) typingRaf = requestAnimationFrame(tick);
  };
  typingRaf = requestAnimationFrame(tick);
}

window.addEventListener("keydown", e => {
  if (!boot.classList.contains("hidden")) {
    if (e.key === "Enter") showBio();
    return;
  }
  if (!bio.classList.contains("hidden")) {
    const input = document.getElementById("cmd-input");
    if (document.activeElement === input) return;
    if (e.key === "ArrowRight")     nextTab(+1);
    else if (e.key === "ArrowLeft") nextTab(-1);
    else if (e.key === "Escape")    showBoot();
  }
});

terminal.addEventListener("click", () => {
  if (!bio.classList.contains("hidden")) {
    document.getElementById("cmd-input")?.focus();
  } else {
    terminal.focus();
  }
});

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length  = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from  = oldText[i] || '';
      const to    = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end   = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '', complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

function doScramble(el) {
  if (el._scrambling) return;
  const val = el.innerText;
  if (!val || !val.trim()) return;
  el._scrambling = true;
  new TextScramble(el).setText(val).then(() => { el._scrambling = false; });
}

function initGlitch() {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  ["bio-ip", "bio-system", "bio-uptime"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    new MutationObserver(() => {
      if (el._scrambling) return;
      const val = el.innerText;
      if (!val || val === "loading\u2026" || val === "resolving\u2026") return;
      el._scrambling = true;
      new TextScramble(el).setText(val).then(() => { el._scrambling = false; });
    }).observe(el, { childList: true, characterData: true, subtree: true });
  });

  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      setTimeout(() => {
        document.querySelectorAll(".page.active .prompt, .page.active .cmd, .page.active .path").forEach(doScramble);
      }, 10);
    });
  });

  document.querySelectorAll(".tab, .link, .key").forEach(el => {
    el.addEventListener("mouseenter", () => doScramble(el));
  });

  const enterKey = document.querySelector(".hint .key");
  if (enterKey) {
    window.addEventListener("keydown", e => { if (e.key === "Enter") doScramble(enterKey); });
  }

  (function scheduleRandom() {
    setTimeout(() => {
      const onBoot = !boot.classList.contains("hidden");
      if (onBoot) {
        const ids = ["bio-ip", "bio-system", "bio-uptime"];
        const el  = document.getElementById(ids[rand(0, ids.length - 1)]);
        if (el && el.innerText && el.innerText !== "loading\u2026" && el.innerText !== "resolving\u2026") doScramble(el);
      } else {
        const pool = [
          ...document.querySelectorAll(".page.active .prompt"),
          ...document.querySelectorAll(".page.active .cmd"),
          ...document.querySelectorAll(".page.active .path"),
          document.querySelector(".title"),
          document.querySelector(".bio-top .prompt-line .prompt"),
          document.querySelector(".bio-top .prompt-line .cmd"),
        ].filter(el => el && !el._scrambling);
        if (pool.length) doScramble(pool[rand(0, pool.length - 1)]);
      }
      scheduleRandom();
    }, rand(5000, 7000));
  })();
}

function initCommandInput() {
  const input  = document.getElementById("cmd-input");
  const output = document.getElementById("cmd-output");
  if (!input || !output) return;

  const history = [];
  let histIdx   = -1;

  const COMMANDS = {
    help: () => `available commands:\n  whoami  clear  ls  pwd  date  uptime  ping  echo [text]  matrix  exit`,
    whoami: () => `nodepec`,
    ls: () => `profile.txt  about.md  skills.txt  projects.json  writeups/  links.txt`,
    pwd: () => `/home/nodepec/bio`,
    date: () => new Date().toString(),
    uptime: () => formatUptime(Date.now() - startedAt),
    clear: () => { output.textContent = ""; output.className = "cmd-output"; return null; },
    exit: () => { setTimeout(showBoot, 150); return "closing session..."; },
    matrix: () => { startMatrix(); return "initiating matrix rain... (any key to stop)"; },
    ping: () => `PING nodepec.dev: 64 bytes from 127.0.0.1 ttl=64 time=0.042ms`,
    echo: (args) => args.join(" ") || "",
  };

  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[history.length - 1 - histIdx] || ""; }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[history.length - 1 - histIdx] || ""; }
      else { histIdx = -1; input.value = ""; }
      return;
    }
    if (e.key !== "Enter") return;

    const raw   = input.value.trim();
    input.value = "";
    histIdx     = -1;
    if (!raw) return;

    history.push(raw);
    const parts = raw.split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1);

    output.className = "cmd-output";

    if (COMMANDS[cmd]) {
      const result = COMMANDS[cmd](args);
      if (result !== null && result !== undefined) {
        output.textContent = result;
      }
    } else {
      output.className  = "cmd-output error";
      output.textContent = `command not found: ${cmd} — type 'help'`;
    }
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Escape") { showBoot(); }
  });
}

let matrixRaf    = null;
let matrixActive = false;

function startMatrix() {
  const canvas = document.getElementById("matrix-canvas");
  if (!canvas) return;
  const ctx     = canvas.getContext("2d");
  const fs      = 14;
  const chars   = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF";

  matrixActive = true;
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const cols   = Math.floor(canvas.width / fs);
  const drops  = Array(cols).fill(1);
  let   mFrame = 0;

  canvas.classList.add("visible");

  const tick = () => {
    if (!matrixActive) return;
    matrixRaf = requestAnimationFrame(tick);
    mFrame++;
    if (mFrame % 3 !== 0) return;
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#28c840";
    ctx.font      = `${fs}px monospace`;
    for (let i = 0; i < drops.length; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, i * fs, drops[i] * fs);
      if (drops[i] * fs > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.4;
    }
  };
  tick();

  const stop = () => {
    stopMatrix();
    window.removeEventListener("keydown", stop);
    window.removeEventListener("click",   stop);
  };
  setTimeout(() => {
    window.addEventListener("keydown", stop);
    window.addEventListener("click",   stop);
  }, 200);
}

function stopMatrix() {
  matrixActive = false;
  cancelAnimationFrame(matrixRaf);
  const canvas = document.getElementById("matrix-canvas");
  if (!canvas) return;
  canvas.classList.remove("visible");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initKonami() {
  const SEQ  = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let   pos  = 0;

  const EGG_ART = ` █████╗  ██████╗ ██████╗███████╗███████╗███████╗
██╔══██╗██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝
███████║██║     ██║     █████╗  ███████╗███████╗
██╔══██║██║     ██║     ██╔══╝  ╚════██║╚════██║
██║  ██║╚██████╗╚██████╗███████╗███████║███████║
╚═╝  ╚═╝ ╚═════╝ ╚═════╝╚══════╝╚══════╝╚══════╝

      [ ACCESS GRANTED ]
      nodepec@l33t.ing
  you found the easter egg gg`;

  window.addEventListener("keydown", e => {
    if (e.key === SEQ[pos]) {
      pos++;
      if (pos === SEQ.length) {
        pos = 0;
        triggerEasterEgg(EGG_ART);
      }
    } else {
      pos = e.key === SEQ[0] ? 1 : 0;
    }
  });
}

function triggerEasterEgg(art) {
  const overlay = document.getElementById("easter-egg");
  const text    = document.getElementById("easter-text");
  if (!overlay || !text) return;
  text.textContent = art;
  overlay.classList.remove("hidden");
  const dismiss = () => {
    overlay.classList.add("hidden");
    window.removeEventListener("keydown", dismiss);
    overlay.removeEventListener("click",  dismiss);
  };
  window.addEventListener("keydown", dismiss);
  overlay.addEventListener("click",  dismiss);
}

function initVisibility() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopMatrix();
    }
  });
}

function initParticles() {
  const CFG = {
    count: 120, size: 2, speed: 0.35, lifetime: 220,
    repelRadius: 90, repelForce: 0.18,
    burstCount: 18, burstSpeed: 3.2,
    color: "#ffffff", opacity: 0.55,
  };

  const stage      = document.querySelector(".stage");
  const terminalEl = document.querySelector("section.terminal");
  const PAD        = 12;
  const canvas     = document.createElement("canvas");

  Object.assign(canvas.style, {
    position: "absolute", inset: "0",
    width: "100%", height: "100%",
    pointerEvents: "none", zIndex: "0",
    imageRendering: "pixelated",
  });

  stage.style.position      = "relative";
  terminalEl.style.position = "relative";
  terminalEl.style.zIndex   = "1";
  stage.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let termRect = { left: 0, top: 0, right: 0, bottom: 0 };
  let paused   = false;

  document.addEventListener("visibilitychange", () => { paused = document.hidden; });

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cr = canvas.getBoundingClientRect();
    const tr = terminalEl.getBoundingClientRect();
    termRect = {
      left:   tr.left   - cr.left - PAD,
      top:    tr.top    - cr.top  - PAD,
      right:  tr.right  - cr.left + PAD,
      bottom: tr.bottom - cr.top  + PAD,
    };
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const inTerminal = (x, y) =>
    x >= termRect.left && x <= termRect.right &&
    y >= termRect.top  && y <= termRect.bottom;

  function randomParticle(burst, bx, by) {
    burst = burst || false; bx = bx || 0; by = by || 0;
    const angle = Math.random() * Math.PI * 2;
    const spd   = burst
      ? CFG.burstSpeed * (0.5 + Math.random())
      : CFG.speed * (0.4 + Math.random() * 0.8);
    let x, y;
    if (burst) { x = bx; y = by; }
    else { do { x = Math.random() * canvas.width; y = Math.random() * canvas.height; } while (inTerminal(x, y)); }
    return {
      x, y,
      vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
      phase: Math.random() * Math.PI * 2,
      life: burst ? 0 : Math.floor(Math.random() * CFG.lifetime),
      maxLife: CFG.lifetime + Math.floor(Math.random() * 80 - 40),
      burst,
    };
  }

  const particles = Array.from({ length: CFG.count }, () => randomParticle());
  const mouse = { x: -9999, y: -9999 };
  const r2    = CFG.repelRadius * CFG.repelRadius;

  window.addEventListener("mousemove", e => {
    const cr = canvas.getBoundingClientRect();
    mouse.x = e.clientX - cr.left;
    mouse.y = e.clientY - cr.top;
  }, { passive: true });

  window.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; }, { passive: true });

  window.addEventListener("click", e => {
    const cr = canvas.getBoundingClientRect();
    const x = e.clientX - cr.left, y = e.clientY - cr.top;
    if (inTerminal(x, y)) return;
    for (let i = 0; i < CFG.burstCount; i++) particles.push(randomParticle(true, x, y));
  });

  let frameCount = 0;

  (function tick() {
    requestAnimationFrame(tick);
    if (paused) return;
    frameCount++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width, h = canvas.height;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      let alpha;
      if (p.life < 20)                  alpha = (p.life / 20) * CFG.opacity;
      else if (p.life > p.maxLife - 40) alpha = ((p.maxLife - p.life) / 40) * CFG.opacity;
      else                              alpha = CFG.opacity;

      if (p.life >= p.maxLife) {
        if (p.burst) { particles.splice(i, 1); continue; }
        Object.assign(p, randomParticle());
        continue;
      }

      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < r2 && dist2 > 0) {
        const dist  = Math.sqrt(dist2);
        const force = CFG.repelForce * (1 - dist / CFG.repelRadius);
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      p.vx *= 0.97; p.vy *= 0.97;

      if (!p.burst) {
        p.vx += Math.sin(p.phase + frameCount * 0.012) * 0.008;
        p.vy += Math.cos(p.phase + frameCount * 0.009) * 0.008;
      }

      p.x += p.vx; p.y += p.vy;

      const buf = 4;
      if (p.x < -buf)    p.x = w + buf;
      if (p.x > w + buf) p.x = -buf;
      if (p.y < -buf)    p.y = h + buf;
      if (p.y > h + buf) p.y = -buf;

      if (inTerminal(p.x, p.y)) continue;

      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle   = CFG.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), CFG.size, CFG.size);
    }

    while (particles.filter(p => !p.burst).length < CFG.count) particles.push(randomParticle());
    ctx.globalAlpha = 1;
  })();
}

function initServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

fillBoot();
setActivePage("profile");
initGlitch();
initParticles();
initCommandInput();
initKonami();
initVisibility();
initServiceWorker();
