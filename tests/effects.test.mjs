import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMatrix } from '../src/effects.ts';

test('Matrix plays on explicit request even with reduced motion and effects off, then cleans up', () => {
  const main = { inert: false };
  let restoredFocus = false;
  const button = { focus() {}, addEventListener() {} };
  const listeners = new Map();
  const overlay = { hidden: true };
  let frames = 0;
  let cancelled = false;
  const mocks = {
    document: { documentElement: { dataset: { motion: 'off' } }, activeElement: { focus() { restoredFocus = true; } }, querySelector(selector) { return selector === 'main' ? main : button; }, addEventListener() {} },
    window: { innerWidth: 800, innerHeight: 600, addEventListener(name, handler) { listeners.set(name, handler); }, removeEventListener(name) { listeners.delete(name); } },
    devicePixelRatio: 1,
    matchMedia() { throw new Error('Explicit Matrix must not consult system motion settings'); },
    requestAnimationFrame() { return ++frames; },
    cancelAnimationFrame() { cancelled = true; },
  };
  const saved = new Map(Object.keys(mocks).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries(mocks)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  try {
    const canvas = { parentElement: overlay, getContext() { return { setTransform() {} }; } };
    const matrix = createMatrix(canvas, () => {});
    assert.equal(matrix.start(), true);
    assert.equal(overlay.hidden, false);
    assert.equal(main.inert, true);
    matrix.start();
    assert.equal(frames, 1, 'repeated starts cannot create duplicate frame loops');
    listeners.get('keydown')({ preventDefault() {}, stopImmediatePropagation() {} });
    assert.equal(overlay.hidden, true);
    assert.equal(main.inert, false);
    assert.equal(restoredFocus, true);
    assert.equal(cancelled, true);
    assert.equal(listeners.size, 0);
  } finally {
    for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
});
