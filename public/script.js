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

function formatUptime(ms) {
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
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
  safeText(elIp, "resolving…");
  const [ip, system] = await Promise.all([getPublicIP(), detectClient()]);
  safeText(elIp, ip);
  safeText(elSystem, system);
  safeText(elUptime, formatUptime(Date.now() - startedAt));
  setInterval(() => safeText(elUptime, formatUptime(Date.now() - startedAt)), 30_000);
}

function showBio() {
  boot.classList.add("hidden");
  bio.classList.remove("hidden");
  terminal.focus({ preventScroll: true });
}

function showBoot() {
  bio.classList.add("hidden");
  boot.classList.remove("hidden");
  terminal.focus({ preventScroll: true });
}

function setActivePage(name) {
  for (const t of tabs) {
    const active = t.dataset.page === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", String(active));
  }
  for (const p of pages) p.classList.toggle("active", p.dataset.page === name);
}

function nextTab(dir) {
  const idx = Math.max(0, tabs.findIndex(t => t.classList.contains("active")));
  setActivePage(tabs[(idx + dir + tabs.length) % tabs.length].dataset.page);
}

tabs.forEach(btn => btn.addEventListener("click", () => setActivePage(btn.dataset.page)));

window.addEventListener("keydown", e => {
  if (!boot.classList.contains("hidden")) {
    if (e.key === "Enter") showBio();
    return;
  }
  if (!bio.classList.contains("hidden")) {
    if (e.key === "ArrowRight")     nextTab(+1);
    else if (e.key === "ArrowLeft") nextTab(-1);
    else if (e.key === "Escape")    showBoot();
  }
});

terminal.addEventListener("click", () => terminal.focus());

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
      if (!val || val === "loading…" || val === "resolving…") return;
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
        if (el && el.innerText && el.innerText !== "loading…" && el.innerText !== "resolving…") doScramble(el);
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

  function randomParticle(burst = false, bx = 0, by = 0) {
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

      p.vx *= 0.97;
      p.vy *= 0.97;

      if (!p.burst) {
        p.vx += Math.sin(p.phase + frameCount * 0.012) * 0.008;
        p.vy += Math.cos(p.phase + frameCount * 0.009) * 0.008;
      }

      p.x += p.vx;
      p.y += p.vy;

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

fillBoot();
setActivePage("profile");
initGlitch();
initParticles();
