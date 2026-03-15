(() => {
  const CFG = {
    count:       120,
    size:        2,
    speed:       0.35,
    lifetime:    220,
    repelRadius: 90,
    repelForce:  0.18,
    burstCount:  18,
    burstSpeed:  3.2,
    color:       "#ffffff",
    opacity:     0.55,
  };

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position:       "fixed",
    inset:          "0",
    pointerEvents:  "none",
    zIndex:         "-1",
    imageRendering: "pixelated",
  });
  document.body.prepend(canvas);

  if (getComputedStyle(document.body).position === "static") {
    document.body.style.position = "relative";
  }

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  function randomParticle(burst = false, bx = 0, by = 0) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = burst
      ? CFG.burstSpeed * (0.5 + Math.random())
      : CFG.speed * (0.4 + Math.random() * 0.8);
    return {
      x:       burst ? bx : Math.random() * canvas.width,
      y:       burst ? by : Math.random() * canvas.height,
      vx:      Math.cos(angle) * spd,
      vy:      Math.sin(angle) * spd,
      phase:   Math.random() * Math.PI * 2,
      life:    burst ? 0 : Math.floor(Math.random() * CFG.lifetime),
      maxLife: CFG.lifetime + Math.floor(Math.random() * 80 - 40),
      burst,
    };
  }

  const particles = Array.from({ length: CFG.count }, () => randomParticle());

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; }, { passive: true });

  window.addEventListener("click", e => {
    for (let i = 0; i < CFG.burstCount; i++) {
      particles.push(randomParticle(true, e.clientX, e.clientY));
    }
  });

  let frameCount = 0;

  function tick() {
    requestAnimationFrame(tick);
    frameCount++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w  = canvas.width;
    const h  = canvas.height;
    const r2 = CFG.repelRadius * CFG.repelRadius;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;

      let alpha;
      const fadeIn  = 20;
      const fadeOut = 40;
      if (p.life < fadeIn) {
        alpha = (p.life / fadeIn) * CFG.opacity;
      } else if (p.life > p.maxLife - fadeOut) {
        alpha = ((p.maxLife - p.life) / fadeOut) * CFG.opacity;
      } else {
        alpha = CFG.opacity;
      }

      if (p.life >= p.maxLife) {
        if (p.burst) { particles.splice(i, 1); continue; }
        Object.assign(p, randomParticle());
        continue;
      }

      const dx    = p.x - mouse.x;
      const dy    = p.y - mouse.y;
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

      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle   = CFG.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), CFG.size, CFG.size);
    }

    while (particles.filter(p => !p.burst).length < CFG.count) {
      particles.push(randomParticle());
    }

    ctx.globalAlpha = 1;
  }

  tick();
})();
