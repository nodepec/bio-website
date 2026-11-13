/** One canvas, one frame loop, with explicit cleanup and reduced-motion support. */
export function createMatrix(canvas: HTMLCanvasElement, onStop: () => void) {
  const overlay = canvas.parentElement!;
  const context = canvas.getContext('2d');
  let frame = 0;
  let running = false;
  let previous = 0;
  let columns: number[] = [];
  let width = 0;
  let height = 0;
  let returnFocus: HTMLElement | null = null;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    columns = Array.from({ length: Math.ceil(width / 17) }, () => -Math.random() * 50);
  }

  function tick(time: number) {
    if (!running || !context) return;
    frame = requestAnimationFrame(tick);
    if (time - previous < 60) return;
    previous = time;
    context.fillStyle = '#02050b18';
    context.fillRect(0, 0, width, height);
    context.font = '14px monospace';
    columns.forEach((drop, index) => {
      context.fillStyle = Math.random() > .95 ? '#dcecff' : '#378dff';
      const char = '01ABCDEFアイウエオカキクケコ'[Math.floor(Math.random() * 26)] ?? '0';
      context.fillText(char, index * 17, drop * 17);
      columns[index] = drop * 17 > height && Math.random() > .97 ? 0 : drop + 1;
    });
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(frame);
    overlay.hidden = true;
    document.querySelector('main')!.inert = false;
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', dismiss, true);
    returnFocus?.focus({ preventScroll: true });
    onStop();
  }

  function dismiss(event: KeyboardEvent) { event.preventDefault(); event.stopImmediatePropagation(); stop(); }
  document.querySelector('#matrix-stop')!.addEventListener('click', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stop(); });

  return {
    start() {
      if (!context || reducedMotion.matches || document.documentElement.dataset.motion === 'off') return false;
      if (running) return true;
      returnFocus = document.activeElement as HTMLElement;
      overlay.hidden = false;
      document.querySelector('main')!.inert = true;
      running = true;
      previous = 0;
      resize();
      document.querySelector<HTMLButtonElement>('#matrix-stop')!.focus();
      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('keydown', dismiss, true);
      frame = requestAnimationFrame(tick);
      return true;
    },
    stop,
  };
}
