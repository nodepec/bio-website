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
  if (el) el.textContent = value ?? "unknown";
}

function formatUptime(ms) {
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getUserLabel() {
  return localStorage.getItem("bio_user")?.trim() || "unknown";
}

async function detectClient() {
  const ua = navigator.userAgent || "";
  let os = "unknown";

  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      const { platform, platformVersion } = await navigator.userAgentData.getHighEntropyValues([
        "platform",
        "platformVersion",
      ]);
      if (platform === "Windows") {
        os = parseInt(platformVersion, 10) >= 13 ? "Windows 11" : "Windows 10";
      } else if (platform === "macOS") {
        os = "macOS";
      } else if (platform === "Android") {
        os = "Android";
      } else if (platform === "iOS") {
        os = "iOS";
      } else if (platform === "Linux") {
        os = "Linux";
      }
    } catch {
    }
  }

  if (os === "unknown") {
    if (/Windows NT/.test(ua))        os = "Windows";
    else if (/Mac OS X/.test(ua))     os = "macOS";
    else if (/Android/.test(ua))      os = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
    else if (/Linux/.test(ua))        os = "Linux";
  }

  let browser = "unknown";
  if (/Edg\//.test(ua))                                          browser = "Edge";
  else if (/Chrome\//.test(ua))                                  browser = "Chrome";
  else if (/Firefox\//.test(ua))                                 browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua))         browser = "Safari";

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

  safeText(elUser, getUserLabel());
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
  for (const p of pages) {
    p.classList.toggle("active", p.dataset.page === name);
  }
}

function nextTab(dir) {
  const idx = Math.max(0, tabs.findIndex((t) => t.classList.contains("active")));
  setActivePage(tabs[(idx + dir + tabs.length) % tabs.length].dataset.page);
}

tabs.forEach((btn) => btn.addEventListener("click", () => setActivePage(btn.dataset.page)));

window.addEventListener("keydown", (e) => {
  if (!boot.classList.contains("hidden")) {
    if (e.key === "Enter") showBio();
    return;
  }
  if (!bio.classList.contains("hidden")) {
    if (e.key === "ArrowRight") nextTab(+1);
    else if (e.key === "ArrowLeft") nextTab(-1);
    else if (e.key === "Escape") showBoot();
  }
});

terminal.addEventListener("click", () => terminal.focus());

fillBoot();
setActivePage("profile");
