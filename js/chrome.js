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
    if (status) status.textContent = '[ SIGNAL ACQUIRED ]';
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

  onScroll(() => nav.classList.toggle('is-stuck', scrollY > 24));

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
  const anchors = [...(links?.querySelectorAll('a') ?? [])];
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

/** Scroll progress along the top of the HUD frame, in 32 discrete steps. */
export function initProgress() {
  const fill = document.querySelector('.hud__progress-fill');
  if (!fill) return;

  onScroll(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const raw = max > 0 ? scrollY / max : 0;
    fill.style.setProperty('--progress', Math.round(raw * 32) / 32);
  });
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

  const draw = () => {
    raf = 0;
    // Snap to a 4px grid so it steps like a sprite instead of gliding.
    el.style.transform = `translate(${Math.round(x / 4) * 4}px, ${Math.round(y / 4) * 4}px)`;
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
