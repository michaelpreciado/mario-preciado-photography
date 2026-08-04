/**
 * chrome.js — the persistent machine around the photographs.
 * Nav, scroll progress, reticle cursor, and the shared section observer.
 */

import { env, onScroll, lockScroll, unlockScroll } from './env.js';
import { set } from './debug.js';

/**
 * One IntersectionObserver for "which section am I in", shared by everything
 * that needs to know.
 *
 * Two things want this now — the nav's current-section highlight and the
 * lighting rig's gel change — and a second observer over the same elements
 * with the same margins would be pure duplication. Subscribers are called with
 * the section element itself rather than its id, because the rig reads its cue
 * from data attributes and not every section on the site has an id.
 *
 * This also quietly fixes a limit in the old version: it used to observe only
 * sections that had a matching in-page nav anchor, which meant nothing fired
 * at all on /work/, /about/ or any frame page.
 */
const sectionSubs = [];
let sectionIO = null;
let currentSection = null;

export function observeSections(fn) {
  sectionSubs.push(fn);
  if (sectionIO) return;

  const targets = [...document.querySelectorAll('main > section, main > article')];
  if (!targets.length) return;

  sectionIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.target === currentSection) continue;
        currentSection = entry.target;
        // One subscriber throwing must not stop the others.
        for (const sub of sectionSubs) {
          try {
            sub(entry.target);
          } catch (err) {
            console.error('[mp] section subscriber failed:', err);
          }
        }
      }
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );

  targets.forEach((t) => sectionIO.observe(t));
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
  // Scroll lock goes through the shared counter in env.js. Writing
  // body.style.overflow directly here is what let the lightbox unlock the page
  // out from under an open drawer.
  let drawerLocked = false;

  const close = () => {
    links?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open menu');
    if (drawerLocked) {
      drawerLocked = false;
      unlockScroll();
    }
  };

  toggle?.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open && !drawerLocked) {
      drawerLocked = true;
      lockScroll();
    } else if (!open && drawerLocked) {
      drawerLocked = false;
      unlockScroll();
    }
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

  observeSections((section) => {
    const id = section.id;
    if (id) anchors.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${id}`));

    // One glitch burst on section change — a state change you can feel, not an
    // animation that runs forever.
    if (!env.reduced && mark) {
      mark.classList.remove('is-glitching');
      void mark.offsetWidth;   // restart the animation
      mark.classList.add('is-glitching');
    }
    set('section', id || section.className.split(' ')[0]);
  });
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
  // Written on the HUD rather than on each fill: the top bar and the left
  // level meter both read `var(--progress)` and inherit it, so one property
  // write drives both and they cannot drift out of step with each other.
  const hud = document.querySelector('.hud');
  if (!hud) return;

  let max = 0;
  let last = -1;

  const measure = () => {
    max = document.documentElement.scrollHeight - innerHeight;
  };

  const update = () => {
    const step = max > 0 ? Math.round((scrollY / max) * 32) / 32 : 0;
    if (step === last) return;
    last = step;
    hud.style.setProperty('--progress', step);
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
