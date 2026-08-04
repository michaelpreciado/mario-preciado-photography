/**
 * env.js — capability detection and safe storage.
 *
 * Everything else reads its gates from here so there's exactly one place that
 * decides "is this a phone", "does this visitor want motion", "can we store
 * anything". The debug panel prints this object verbatim, which is what turns
 * "it looks different on their machine" into a one-paste answer.
 */

const mq = (q) => window.matchMedia(q);

const REDUCED = mq('(prefers-reduced-motion: reduce)');
const RICH = mq('(min-width: 64rem) and (hover: hover) and (pointer: fine)');
const TOUCH = mq('(hover: none)');

export const env = {
  /**
   * Honour the OS setting for every effect, everywhere.
   *
   * Getters, not values read once at module load. Someone can turn reduced
   * motion on mid-session — often precisely because a page is making them
   * uncomfortable — and a snapshot taken at load would ignore them until they
   * reloaded. The debug panel prints these, so it always reports live state.
   */
  get reduced() { return REDUCED.matches; },

  /** Desktop with a real pointer — the only place heavy chrome is allowed. */
  get rich() { return RICH.matches; },

  /** No hover means metadata can never live behind a hover state. */
  get touch() { return TOUCH.matches; },

  debug: new URLSearchParams(location.search).has('debug'),
};

/**
 * Scroll lock, reference counted.
 *
 * Three things now want to freeze the page: the intro overlay, the mobile nav
 * drawer, and the lightbox. Each writing document.body.style.overflow directly
 * means whichever unlocks first unlocks for all of them — close the lightbox
 * you opened from behind an open drawer and the page scrolls under it. A depth
 * counter is the whole fix.
 */
let locks = 0;

export function lockScroll() {
  if (locks === 0) document.body.style.overflow = 'hidden';
  locks += 1;
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) document.body.style.overflow = '';
}

/** Escape hatch for error paths that must guarantee a scrollable page. */
export function resetScrollLock() {
  locks = 0;
  document.body.style.overflow = '';
}

/**
 * sessionStorage throws outright in some privacy modes rather than failing
 * soft, and an uncaught throw here would take the whole boot sequence — and
 * therefore the page — down with it.
 */
export const store = {
  available: (() => {
    try {
      const k = '__probe';
      sessionStorage.setItem(k, '1');
      sessionStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })(),

  get(key) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      /* storage unavailable — callers must behave as if nothing was stored */
    }
  },
};

/** rAF-coalesced scroll/resize handler. Always passive. */
export function onScroll(fn) {
  let ticking = false;
  const handler = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      fn();
      ticking = false;
    });
  };
  addEventListener('scroll', handler, { passive: true });
  addEventListener('resize', handler, { passive: true });
  fn();
  return handler;
}

/** Resolves when the image has pixels, or immediately if it already does. */
export function imageReady(img) {
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', resolve, { once: true });
  });
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
