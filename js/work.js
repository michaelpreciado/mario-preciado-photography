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
 * Resolve each photograph out of its pixel veil.
 *
 * Two things keep this smooth:
 *
 * 1. What animates is the veil (a 24px LQIP upscaled), never the photograph.
 *    Fading the full-resolution image meant recompositing it on every frame of
 *    the transition.
 * 2. `img.decode()` is awaited before the veil is pulled, so the fade can never
 *    race decoding. Without it the browser may still be rasterising the frame
 *    as it becomes visible, which is exactly when a stutter is most obvious.
 *
 * The veil is then removed from the DOM flow so it stops costing a layer.
 */
export function initImages() {
  // Selected structurally, not by class. Listing every variant (.frame__img,
  // .hero__img, .signal__img, .solo__img…) means each new page type silently
  // ships with a veil that never lifts — which is exactly what happened to the
  // single-frame pages.
  const imgs = [...document.querySelectorAll('.frame__media picture img')];

  const reveal = (img) => {
    const media = img.closest('.frame__media');
    if (!media || media.classList.contains('is-loaded')) return;
    media.classList.add('is-loaded');
    // Retire the veil once it has finished fading, so it stops being composited.
    const done = () => media.classList.add('is-retired');
    media.querySelector('.frame__veil')?.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 1200);   // belt and braces if the transition never fires
  };

  const settle = (img) => {
    // decode() rejects on a broken image; either way the veil must lift rather
    // than leave the visitor staring at a permanent blur.
    if (typeof img.decode === 'function') img.decode().then(() => reveal(img), () => reveal(img));
    else reveal(img);
  };

  imgs.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) settle(img);
    else {
      img.addEventListener('load', () => settle(img), { once: true });
      img.addEventListener('error', () => reveal(img), { once: true });
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
