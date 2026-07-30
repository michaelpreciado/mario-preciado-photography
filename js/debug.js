/**
 * debug.js — `?debug` instrumentation.
 *
 * Ships inert: nothing below runs unless the flag is set, and the CSS that
 * styles it is scoped to `.debug`. The point is to answer, without a rebuild,
 * the questions that actually cost time on this site — which gates are active,
 * which variant each photo really fetched, whether reveals fired, and whether
 * anything is dropping frames.
 */

import { env, store } from './env.js';

let panel = null;
const lines = new Map();

export function initDebug() {
  if (!env.debug) return;

  document.documentElement.classList.add('debug');

  panel = document.createElement('div');
  panel.className = 'dbg';
  document.body.appendChild(panel);

  set('env', capabilities());
  trackFrames();
  // Images resolve their srcset only after layout, so sample late.
  addEventListener('load', () => setTimeout(reportImages, 300));
}

/** One-line capability report — paste this when a bug won't reproduce. */
function capabilities() {
  const supports = (prop, val) => (CSS.supports(prop, val) ? 'y' : 'n');
  return [
    `reduced:${env.reduced ? 'y' : 'n'}`,
    `rich:${env.rich ? 'y' : 'n'}`,
    `touch:${env.touch ? 'y' : 'n'}`,
    `storage:${store.available ? 'y' : 'n'}`,
    `dpr:${devicePixelRatio}`,
    `vp:${innerWidth}x${innerHeight}`,
    `svh:${supports('height', '100svh')}`,
    `cv:${supports('content-visibility', 'auto')}`,
    `view():${supports('animation-timeline', 'view()')}`,
  ].join(' ');
}

/**
 * The single most valuable check on this site: `sizes` is what decides whether
 * a phone downloads a 480px file or a 1280px one, and a wrong value fails
 * silently — the page looks identical and the payload quietly triples.
 */
function reportImages() {
  const imgs = [...document.querySelectorAll('picture img')];
  const picked = imgs.map((img) => {
    const file = (img.currentSrc || img.src).split('/').pop();
    return { file, w: img.getBoundingClientRect().width | 0 };
  });
  const avif = picked.filter((p) => p.file.endsWith('.avif')).length;
  set('img', `${imgs.length} frames · ${avif} avif · widths ${[...new Set(picked.map((p) => p.file.match(/-(\d+)\./)?.[1]))].join('/')}`);

  const oversized = picked.filter((p) => {
    const w = +(p.file.match(/-(\d+)\./)?.[1] || 0);
    return p.w && w > p.w * devicePixelRatio * 1.6;
  });
  if (oversized.length) {
    set('warn', `<span class="warn">${oversized.length} oversized for their box — check \`sizes\`</span>`);
  }
}

function trackFrames() {
  let frames = 0;
  let last = performance.now();
  const tick = (now) => {
    frames += 1;
    if (now - last >= 1000) {
      set('fps', `${frames}`);
      frames = 0;
      last = now;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  if ('PerformanceObserver' in window) {
    try {
      let long = 0;
      new PerformanceObserver((list) => {
        long += list.getEntries().length;
        set('longtasks', long > 0 ? `<span class="warn">${long}</span>` : '0');
      }).observe({ entryTypes: ['longtask'] });
    } catch {
      /* longtask unsupported — not worth a fallback */
    }
  }
}

/** Update a named line in the panel. */
export function set(key, value) {
  if (!panel) return;
  lines.set(key, value);
  panel.innerHTML = [...lines].map(([k, v]) => `<b>${k}</b> ${v}`).join('\n');
}

export function count(key, n) {
  set(key, String(n));
}
