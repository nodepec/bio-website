const terminal = document.getElementById("terminal");
const boot = document.getElementById("boot");
const bio = document.getElementById("bio");

const elUser = document.getElementById("bio-user");
const elIp = document.getElementById("bio-ip");
const elSystem = document.getElementById("bio-system");
const elUptime = document.getElementById("bio-uptime");
const asciiEl = document.getElementById("ascii-logo");

const tabs = Array.from(document.querySelectorAll(".tab"));
const pages = Array.from(document.querySelectorAll(".page"));

const startedAt = Date.now();

const HACKER_CAT = String.raw`
     welcome!
    /\_/\           ___
   = o_o =_______    \ \ 
    __^      __(  \.__) )
(@)<_____>__(_____)____/
`;

function safeText(el, value) {
  if (!el) return;
  el.textContent = value ?? "unknown";
}

function detectOS() {
  const ua = navigator.userAgent || "";
  const plat = navigator.platform || "";

  if (/Windows NT 10\.0/.test(ua)) return "Windows 10";
  if (/Windows NT 11\.0/.test(ua)) return "Windows 11";
  if (/Mac OS X/.test(ua) || /Mac/.test(plat)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Linux/.test(ua) || /Linux/.test(plat)) return "Linux";

  return "unknown";
}

function detectBrowser() {
  const ua = navigator.userAgent || "";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Safari";
  return "unknown";
}

/* Public IP requires an external service. If blocked/offline -> unknown. */
async function getPublicIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    if (!res.ok) throw new Error("ip service failed");
    const data = await res.json();
    return data?.ip || "unknown";
  } catch {
    return "unknown";
  }
}

function getUserLabel() {
  const saved = localStorage.getItem("bio_user");
  return saved && saved.trim().length ? saved.trim() : "unknown";
}

function formatUptime(ms) {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}h ${mm}m`;
  return `${m}m`;
}

function updateUptime() {
  safeText(elUptime, formatUptime(Date.now() - startedAt));
}

async function fillBoot() {
  if (asciiEl) asciiEl.textContent = HACKER_CAT.trimEnd();

  safeText(elUser, getUserLabel());

  const os = detectOS();
  const browser = detectBrowser();
  safeText(elSystem, os === "unknown" ? browser : `${os} (${browser})`);

  safeText(elIp, "resolving…");
  safeText(elIp, await getPublicIP());

  updateUptime();
  setInterval(updateUptime, 30_000);
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
  tabs.forEach((t) => {
    const active = t.dataset.page === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", String(active));
  });

  pages.forEach((p) => {
    p.classList.toggle("active", p.dataset.page === name);
  });
}

function getActiveIndex() {
  return Math.max(0, tabs.findIndex((t) => t.classList.contains("active")));
}

function nextTab(dir) {
  const idx = getActiveIndex();
  const next = (idx + dir + tabs.length) % tabs.length;
  setActivePage(tabs[next].dataset.page);
}

tabs.forEach((btn) => btn.addEventListener("click", () => setActivePage(btn.dataset.page)));

window.addEventListener("keydown", (e) => {
  // Boot -> Enter
  if (!boot.classList.contains("hidden")) {
    if (e.key === "Enter") showBio();
    return;
  }

  // Bio keys
  if (!bio.classList.contains("hidden")) {
    if (e.key === "ArrowRight") nextTab(+1);
    if (e.key === "ArrowLeft") nextTab(-1);
    if (e.key === "Escape") showBoot();
  }
});

terminal.addEventListener("click", () => terminal.focus());

// Start
fillBoot();
setActivePage("profile");
