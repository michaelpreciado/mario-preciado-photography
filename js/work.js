/**
 * work.js — scroll reveals and image load state.
 *
 * IntersectionObserver is the baseline here, not a fallback: CSS
 * `animation-timeline: view()` is still behind a flag in Firefox, so building
 * on it would leave those visitors with a permanently hidden gallery.
 */

import { env } from './env.js';
import { set } from './debug.js';

/** Blocky clip-path wipe as each element enters. Fires once. */
export function initReveals() {
  const targets = [...document.querySelectorAll('.reveal')];
  if (!targets.length) return;

  // Reduced motion: show everything immediately, skip the observer entirely.
  if (env.reduced) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  let shown = 0;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
        set('revealed', `${(shown += 1)}/${targets.length}`);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  targets.forEach((el) => io.observe(el));

  // Safety net for content-visibility: a section that never gets laid out can
  // leave its children un-intersected. If anything is still hidden well after
  // load, show it — a missing animation is fine, missing photographs are not.
  addEventListener('load', () => {
    setTimeout(() => {
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && !el.classList.contains('is-in')) el.classList.add('is-in');
      });
    }, 1200);
  });
}

/**
 * Fade each photograph in over its own LQIP. The placeholder is already
 * painted as the element's background, so this reads as the frame resolving
 * out of 8-bit blocks into full fidelity.
 */
export function initImages() {
  const imgs = [...document.querySelectorAll('.frame__img, .hero__img, .signal__img')];

  const mark = (img) => img.classList.add('is-loaded');

  imgs.forEach((img) => {
    // Cached images are already complete before this module runs.
    if (img.complete && img.naturalWidth > 0) mark(img);
    else {
      img.addEventListener('load', () => mark(img), { once: true });
      // A broken file must still clear the placeholder rather than sit on a
      // blurred block forever.
      img.addEventListener('error', () => mark(img), { once: true });
    }
  });

  set('images', `${imgs.length}`);
}

/** `04 / 11` counter in the hero telemetry line. */
export function initCount() {
  const el = document.querySelector('.hero__count');
  if (!el) return;
  const n = document.querySelectorAll('.work__seq .frame').length;
  el.textContent = `${String(n).padStart(2, '0')} FRAMES`;
}
