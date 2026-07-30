/**
 * chrome.js — the persistent machine around the photographs.
 * Boot sequence, nav, scroll progress, reticle cursor.
 */

import { env, store, onScroll, imageReady, wait } from './env.js';
import { set } from './debug.js';

const BOOT_KEY = 'mp:booted';
const BOOT_MIN = 600;   // desktop floor
const BOOT_MIN_SM = 400;
const BOOT_MAX = 900;

/**
 * First visit only, and never at the cost of the page.
 *
 * The floor matters: the bar tracks the hero image decoding, and on a repeat
 * or warm-cache load that resolves in ~0ms, which makes the bar snap straight
 * to 100% and read as broken. Racing decode against a minimum duration keeps
 * it feeling deliberate. The ceiling matters more — a slow connection must
 * never leave someone staring at a progress bar, so it resolves regardless.
 */
export async function initBoot() {
  const boot = document.getElementById('boot');
  if (!boot) return;

  const seen = store.get(BOOT_KEY);
  // Reduced motion skips it outright. `?debug` always replays it.
  if (env.reduced || (seen && !env.debug)) {
    boot.remove();
    return;
  }

  boot.hidden = false;
  document.body.style.overflow = 'hidden';

  const fill = boot.querySelector('.boot__fill');
  const status = boot.querySelector('.boot__status');
  const skip = boot.querySelector('.boot__skip');
  const hero = document.querySelector('.hero__img');

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    store.set(BOOT_KEY, '1');
    if (status) status.textContent = 'Ready';
    if (fill) fill.style.setProperty('--boot-progress', 1);
    boot.classList.add('is-done');
    document.body.style.overflow = '';
    setTimeout(() => boot.remove(), 420);
  };

  skip?.addEventListener('click', finish);
  addEventListener('keydown', finish, { once: true });

  // Quantised so the bar ticks in 8-bit steps rather than sliding.
  let p = 0;
  const timer = setInterval(() => {
    p = Math.min(0.92, p + 0.08);
    fill?.style.setProperty('--boot-progress', Math.round(p * 8) / 8);
  }, 90);

  const floor = innerWidth < 768 ? BOOT_MIN_SM : BOOT_MIN;
  await Promise.race([
    Promise.all([imageReady(hero), wait(floor)]),
    wait(BOOT_MAX),
  ]);

  clearInterval(timer);
  finish();
}

/** Sticky background, current-section indicator, mobile drawer. */
export function initNav() {
  const nav = document.querySelector('.nav');
  const links = document.getElementById('nav-links');
  const toggle = document.querySelector('.nav__toggle');
  const mark = document.querySelector('.nav__name');
  if (!nav) return;

  // Guarded so a class write (and the style invalidation behind it) only
  // happens on the transition, not on every scroll frame.
  let stuck = null;
  onScroll(() => {
    const next = scrollY > 24;
    if (next === stuck) return;
    stuck = next;
    nav.classList.toggle('is-stuck', next);
  });

  // ── mobile drawer ──
  const close = () => {
    links?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  };

  toggle?.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links?.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links?.classList.contains('is-open')) {
      close();
      toggle?.focus();
    }
  });

  // ── current section ──
  // Only in-page anchors. Since the site went multi-page the nav mostly holds
  // path hrefs ("/work/"), and passing one of those to querySelector throws a
  // SyntaxError — the current page is marked server-side with aria-current
  // instead.
  const anchors = [...(links?.querySelectorAll('a[href^="#"]') ?? [])];
  const sections = anchors
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;

  let current = '';
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id;
        if (id === current) continue;
        current = id;
        anchors.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${id}`));
        // One glitch burst on section change — a state change you can feel,
        // not an animation that runs forever.
        if (!env.reduced && mark) {
          mark.classList.remove('is-glitching');
          void mark.offsetWidth;   // restart the animation
          mark.classList.add('is-glitching');
        }
        set('section', id);
      }
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );
  sections.forEach((s) => io.observe(s));
}

/**
 * Scroll progress along the top of the HUD frame, in 32 discrete steps.
 *
 * Two things matter for holding 120Hz, where the whole frame budget is 8.3ms:
 *
 * 1. `scrollHeight` is never read inside the scroll handler. Reading it forces
 *    a synchronous layout, and doing that once per scroll frame was costing a
 *    forced reflow on literally every frame of a scroll.
 * 2. The custom property is only written when the quantised step actually
 *    changes. It moves in 32 steps over the whole page, so the vast majority
 *    of frames need no style invalidation at all.
 */
export function initProgress() {
  const fill = document.querySelector('.hud__progress-fill');
  if (!fill) return;

  let max = 0;
  let last = -1;

  const measure = () => {
    max = document.documentElement.scrollHeight - innerHeight;
  };

  const update = () => {
    const step = max > 0 ? Math.round((scrollY / max) * 32) / 32 : 0;
    if (step === last) return;
    last = step;
    fill.style.setProperty('--progress', step);
  };

  measure();
  onScroll(update);

  addEventListener('resize', () => { measure(); update(); }, { passive: true });
  // Lazy images landing changes the document height, so re-measure as they do
  // rather than reading it per frame.
  addEventListener('load', measure);
  if ('ResizeObserver' in window) {
    let raf = 0;
    new ResizeObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; measure(); update(); });
    }).observe(document.body);
  }
}

/**
 * Reticle cursor, desktop-with-a-real-pointer only.
 *
 * `cursor: none` is applied from here rather than the stylesheet on purpose:
 * if this module ever fails to load, CSS alone would have already hidden the
 * system cursor and left the visitor with no pointer at all.
 */
export function initCursor() {
  if (!env.rich || env.reduced) return;

  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
  document.documentElement.style.cursor = 'none';

  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let raf = 0;

  let lastX = -1;
  let lastY = -1;

  const draw = () => {
    raf = 0;
    // Snap to a 4px grid so it steps like a sprite instead of gliding. The snap
    // also means most frames land on the same cell, so skipping the write when
    // nothing moved removes ~3 in 4 style invalidations during a slow drag.
    const gx = Math.round(x / 4) * 4;
    const gy = Math.round(y / 4) * 4;
    if (gx === lastX && gy === lastY) return;
    lastX = gx;
    lastY = gy;
    // translate3d keeps it on the compositor rather than repainting.
    el.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
  };

  addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(draw);
    },
    { passive: true }
  );

  const interactive = 'a, button, .frame, input, textarea, summary';
  addEventListener('pointerover', (e) => {
    el.classList.toggle('is-active', !!e.target.closest?.(interactive));
  }, { passive: true });

  // Leaving the window shouldn't strand a floating square.
  document.addEventListener('pointerleave', () => (el.style.opacity = '0'));
  document.addEventListener('pointerenter', () => (el.style.opacity = '1'));
}

/**
 * Depth. Hero and featured frames drift slower than the page, the way a long
 * lens separates a subject from its background.
 *
 * Only a CSS custom property feeding a transform is written — no layout is read
 * in the scroll handler, and element positions are measured once up front and
 * again on resize. Offscreen elements are skipped entirely.
 */
export function initParallax() {
  if (!env.rich || env.reduced) return;

  const items = [...document.querySelectorAll('.parallax')].map((el) => ({
    el,
    rate: Number(el.dataset.parallax) || 0.15,
    top: 0,
    h: 0,
    last: null,
  }));
  if (!items.length) return;

  const measure = () => {
    for (const i of items) {
      const r = i.el.getBoundingClientRect();
      i.top = r.top + scrollY;
      i.h = r.height;
    }
  };

  measure();

  onScroll(() => {
    for (const i of items) {
      const rel = scrollY - i.top;
      // Nothing to do while the element is nowhere near the viewport.
      if (rel < -innerHeight || rel > i.h + innerHeight) continue;
      const py = Math.round(rel * i.rate);
      if (py === i.last) continue;   // skip redundant style writes
      i.last = py;
      i.el.style.setProperty('--py', `${py}px`);
    }
  });

  addEventListener('resize', measure, { passive: true });
  addEventListener('load', measure);
}
