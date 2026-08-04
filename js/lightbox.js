/**
 * lightbox.js — full screen, without leaving the page.
 *
 * This sits alongside the real /work/<slug>/ pages rather than replacing them.
 * Those pages are the shareable, crawlable, linkable version of each frame and
 * they stay the primary click. The lightbox is for the other mode: flicking
 * through the set quickly without paying for a navigation each time.
 *
 * Built on a native <dialog> and showModal(), which brings the focus trap,
 * Escape, the inert background and the top layer with it. Every one of those is
 * a thing that goes quietly wrong when hand-rolled, and three of them are
 * invisible when they break.
 *
 * The photograph is not re-specified here. The grid's own <picture> — with its
 * full AVIF and WebP ladder — is cloned, and only `sizes` is rewritten. So no
 * second copy of the image manifest ships in the HTML, the browser picks the
 * right rung by itself, and the already-decoded grid variant paints instantly
 * as its own placeholder while a larger one streams in behind it. That is the
 * .frame__veil idea pointed at a different problem.
 */

import { lockScroll, unlockScroll } from './env.js';

const ICON_EXPAND =
  '<svg class="sprite" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 2h5v2H4v3H2V2zm7 0h5v5h-2V4H9V2zM2 9h2v3h3v2H2V9zm10 0h2v5H9v-2h3V9z"/></svg>';

const SWIPE = 48;

let frames = [];
let index = 0;

/** Called by the filter so the arrows only ever walk what's on screen. */
export function setLightboxSet(next) {
  frames = next;
}

export function initLightbox() {
  const lb = document.getElementById('lb');
  if (!lb || typeof lb.showModal !== 'function') return;

  const stage = lb.querySelector('.lb__stage');
  const meta = lb.querySelector('.lb__meta');
  const prevBtn = lb.querySelector('.lb__nav--prev');
  const nextBtn = lb.querySelector('.lb__nav--next');
  const closeBtn = lb.querySelector('.lb__close');

  const all = [...document.querySelectorAll('.work__seq .frame')];
  frames = all;

  // ── triggers ──
  // Injected here rather than emitted by the build, for the same reason
  // `cursor: none` is applied from script: a control that cannot work without
  // JavaScript should not exist in markup served to someone without it.
  const addTrigger = (host, label, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'frame__zoom';
    btn.innerHTML = ICON_EXPAND;
    btn.setAttribute('aria-label', label);
    btn.addEventListener('click', () => open(i));
    host.appendChild(btn);
  };

  all.forEach((fig, i) => addTrigger(fig, `View ${fig.dataset.title ?? 'frame'} full screen`, i));

  // The solo page's photograph has nowhere to navigate to, so going full screen
  // is the obvious gesture there and gives the lightbox a home on that page too.
  // Its .solo__stage stands in for a figure: show() only needs something that
  // contains a <picture>.
  if (!all.length) {
    const solo = document.querySelector('.solo__stage');
    if (!solo) return;
    solo.style.position = 'relative';
    addTrigger(solo, 'View this frame full screen', 0);
    frames = [solo];
  }

  if (!frames.length) return;

  let opener = null;

  function show(i) {
    index = (i + frames.length) % frames.length;
    const fig = frames[index];
    const src = fig.querySelector('picture');
    if (!src) return;

    const clone = src.cloneNode(true);
    const img = clone.querySelector('img');

    if (img) {
      // `sizes` computed from the intrinsic width/height attributes already on
      // the img — no getBoundingClientRect, so no layout read on open.
      //
      // 0.9, not the 0.8 used for the hero in tools/lib/media.mjs. That
      // understatement is paid for by the hero sitting behind a heavy scrim
      // with display type over it; here the photograph is the entire screen
      // with nothing on top, which is the one place softness is obvious.
      // Measured against this ladder, 0.9 lands both a 1x desktop and a 3x
      // phone on the 960 rung — sharp on the big screen, and still not the
      // widest file over mobile data.
      const ar = (img.width || 3) / (img.height || 4);
      const w = Math.min(innerWidth * 0.94, innerHeight * 0.86 * ar);
      const px = `${Math.round(w * 0.9)}px`;

      // The candidate lists have to come off before `sizes` goes on.
      //
      // A cloned <img> begins loading the moment it has a src, detached or not
      // — so it was picking a rung against the GRID's sizes ("92vw"), which at
      // desktop width resolves to the widest file on the ladder. Stripping
      // srcset/src first, then restoring them after sizes is set, forces the
      // selection to happen once, with the right number. Measured: this is the
      // difference between fetching the 1280 rung and the 960 one.
      const sources = [...clone.querySelectorAll('source')].map((s) => {
        const ss = s.getAttribute('srcset');
        s.removeAttribute('srcset');
        return [s, ss];
      });
      const imgSrcset = img.getAttribute('srcset');
      const imgSrc = img.getAttribute('src');
      img.removeAttribute('srcset');
      img.removeAttribute('src');

      img.className = 'lb__img';
      img.loading = 'eager';
      img.fetchPriority = 'high';
      img.removeAttribute('width');
      img.removeAttribute('height');

      sources.forEach(([s, ss]) => { s.setAttribute('sizes', px); if (ss) s.setAttribute('srcset', ss); });
      img.setAttribute('sizes', px);
      if (imgSrcset) img.setAttribute('srcset', imgSrcset);
      if (imgSrc) img.setAttribute('src', imgSrc);
    }

    stage.replaceChildren(clone);
    stage.style.removeProperty('--dx');

    const title = fig.dataset.title ?? document.querySelector('.solo__title')?.textContent ?? '';
    if (meta) meta.textContent = `${String(index + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')} — ${title}`;

    const single = frames.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
  }

  function open(i) {
    opener = document.activeElement;
    show(i);
    lb.showModal();
    lockScroll();
    closeBtn.focus();
  }

  function close() {
    if (!lb.open) return;
    lb.close();
  }

  lb.addEventListener('close', () => {
    unlockScroll();
    stage.replaceChildren();
    // showModal restores focus on its own in most engines; doing it explicitly
    // covers the ones that don't and costs nothing when they do.
    opener?.focus?.();
    opener = null;
  });

  // Escape arrives as `cancel`. Letting it through unmodified is fine — the
  // `close` handler above does the cleanup either way.
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));

  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    else if (e.key === 'Home') { e.preventDefault(); show(0); }
    else if (e.key === 'End') { e.preventDefault(); show(frames.length - 1); }
  });

  // Clicking the empty ground around the photograph closes, the way a
  // fullscreen viewer is expected to.
  stage.addEventListener('click', (e) => {
    if (e.target === stage) close();
  });

  // ── swipe ──
  // Transform only while dragging; the photograph is moved, never filtered,
  // tinted or reshaped.
  let x0 = 0;
  let y0 = 0;
  let dragging = false;

  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    dragging = true;
    x0 = e.clientX;
    y0 = e.clientY;
    lb.classList.remove('is-settling');
  });

  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > Math.abs(e.clientY - y0)) stage.style.setProperty('--dx', `${dx}px`);
  }, { passive: true });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - x0;
    const dy = e.clientY - y0;
    lb.classList.add('is-settling');
    stage.style.removeProperty('--dx');

    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
    else if (dy > SWIPE * 2 && Math.abs(dy) > Math.abs(dx) * 1.5) close();
  };

  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', () => { dragging = false; stage.style.removeProperty('--dx'); });
}
