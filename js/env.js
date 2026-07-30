/**
 * env.js — capability detection and safe storage.
 *
 * Everything else reads its gates from here so there's exactly one place that
 * decides "is this a phone", "does this visitor want motion", "can we store
 * anything". The debug panel prints this object verbatim, which is what turns
 * "it looks different on their machine" into a one-paste answer.
 */

const mq = (q) => window.matchMedia(q);

export const env = {
  /** Honour the OS setting for every effect, everywhere. */
  reduced: mq('(prefers-reduced-motion: reduce)').matches,

  /** Desktop with a real pointer — the only place heavy chrome is allowed. */
  rich: mq('(min-width: 64rem) and (hover: hover) and (pointer: fine)').matches,

  /** No hover means metadata can never live behind a hover state. */
  touch: mq('(hover: none)').matches,

  debug: new URLSearchParams(location.search).has('debug'),
};

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
