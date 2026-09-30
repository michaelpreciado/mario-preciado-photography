/**
 * glow.js — the pointer lamp.
 *
 * Two things follow the pointer, both as custom properties so the work stays in
 * CSS: a soft magenta pool on the page ground (.spot, behind every photograph),
 * and a per-cell spotlight inside service and process cells (--mx/--my on the
 * cell, read by the hover rule in §29).
 *
 * Desktop pointer only, and never under reduced motion — the same gate as the
 * cursor. One passive listener, one rAF, and it writes only when the pointer
 * actually moved a frame's worth.
 */

import { env } from './env.js';

const CELLS = '.svc, .step';

export function initGlow() {
  if (!env.rich || env.reduced) return;

  const spot = document.createElement('div');
  spot.className = 'spot';
  spot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(spot);

  let x = 0;
  let y = 0;
  let target = null;
  let raf = 0;

  const draw = () => {
    raf = 0;
    spot.style.setProperty('--mx', `${x}px`);
    spot.style.setProperty('--my', `${y}px`);
    if (target) {
      const r = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${x - r.left}px`);
      target.style.setProperty('--my', `${y - r.top}px`);
    }
  };

  addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      target = e.target instanceof Element ? e.target.closest(CELLS) : null;
      if (!raf) raf = requestAnimationFrame(draw);
    },
    { passive: true }
  );
}
