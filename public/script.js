document.addEventListener("DOMContentLoaded", () => {
  try {
    const faLoaded =
      (document.fonts && (document.fonts.check('1em "Font Awesome 6 Free"') ||
                          document.fonts.check('1em "Font Awesome 6 Brands"'))) ||
      Array.from(document.styleSheets).some(ss => {
        try {
          return Array.from(ss.cssRules || []).some(rule =>
            rule.cssText && /font[- ]family\s*:\s*["']?Font Awesome/i.test(rule.cssText)
          );
        } catch { return false; }
      });

    if (!faLoaded) document.documentElement.classList.add("fa-missing");
  } catch {
    document.documentElement.classList.add("fa-missing");
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  document.querySelectorAll(".tile").forEach(tile => {
    tile.addEventListener("mouseenter", () => tile.classList.add("pulse"));
    tile.addEventListener("mouseleave", () => tile.classList.remove("pulse"));
    tile.addEventListener("focus", () => tile.classList.add("pulse"));
    tile.addEventListener("blur", () => tile.classList.remove("pulse"));
  });
});