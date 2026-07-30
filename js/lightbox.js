/**
 * lightbox.js — full-size viewer.
 *
 * Built on a real <dialog>, so the modal semantics, focus trap, backdrop and
 * Escape handling come from the platform rather than from hand-rolled key
 * juggling. Arrow keys, swipe and neighbour preloading are ours.
 */

import { env } from './env.js';

const ARROW_L = 'M10 2h2v2h-2V2zM8 4h2v2H8V4zM6 6h2v2H6V6zM4 8h2v2H4V8zm2 2h2v2H6v-2zm2 2h2v2H8v-2zm2 2h2v2h-2v-2z';
const ARROW_R = 'M4 2h2v2H4V2zm2 2h2v2H6V4zm2 2h2v2H8V6zm2 2h2v2h-2V8zm-2 2h2v2H8v-2zm-2 2h2v2H6v-2zm-2 2h2v2H4v-2z';
const CLOSE = 'M2 3h2V1h2v2h4V1h2v2h2v2h-2v4h2v2h-2v2h-2v-2H6v2H4v-2H2v-2h2V5H2V3zm4 2v6h4V5H6z';

export function initLightbox() {
  const frames = [...document.querySelectorAll('.work__seq .frame')];
  if (!frames.length) return;

  const items = frames.map((f) => ({
    full: f.dataset.full,
    avif: f.dataset.fullAvif,
    title: f.dataset.title,
    alt: f.dataset.alt,
    el: f,
  }));

  const dialog = document.createElement('dialog');
  dialog.className = 'lb';
  dialog.innerHTML = `
    <div class="lb__stage">
      <div class="lb__top">
        <span class="lb__count"></span>
        <div class="lb__nav">
          <button class="lb__btn" type="button" data-act="prev" aria-label="Previous photograph">
            <svg class="sprite" viewBox="0 0 16 16" aria-hidden="true"><path d="${ARROW_L}"/></svg>
          </button>
          <button class="lb__btn" type="button" data-act="next" aria-label="Next photograph">
            <svg class="sprite" viewBox="0 0 16 16" aria-hidden="true"><path d="${ARROW_R}"/></svg>
          </button>
          <button class="lb__btn" type="button" data-act="close" aria-label="Close viewer">
            <svg class="sprite" viewBox="0 0 16 16" aria-hidden="true"><path d="${CLOSE}"/></svg>
          </button>
        </div>
      </div>
      <figure class="lb__fig">
        <picture>
          <source class="lb__avif" type="image/avif">
          <img class="lb__img" alt="">
        </picture>
      </figure>
      <figcaption class="lb__cap">
        <span class="lb__no mono"></span>
        <span class="lb__title"></span>
        <span class="lb__alt"></span>
      </figcaption>
    </div>
    <p class="lb__sr" role="status" aria-live="polite"></p>
  `;
  document.body.appendChild(dialog);

  const img = dialog.querySelector('.lb__img');
  const avif = dialog.querySelector('.lb__avif');
  const count = dialog.querySelector('.lb__count');
  const no = dialog.querySelector('.lb__no');
  const title = dialog.querySelector('.lb__title');
  const alt = dialog.querySelector('.lb__alt');
  const live = dialog.querySelector('.lb__sr');

  let index = 0;
  let opener = null;

  const preload = (i) => {
    const it = items[(i + items.length) % items.length];
    if (it) new Image().src = it.full;
  };

  function render() {
    const it = items[index];
    const swap = () => {
      avif.srcset = it.avif ?? '';
      img.src = it.full;
      img.alt = it.alt;
      title.textContent = it.title;
      alt.textContent = it.alt;
      no.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
      live.textContent = `Photograph ${index + 1} of ${items.length}: ${it.title}`;
      dialog.classList.remove('is-swapping');
    };

    if (env.reduced) return swap();

    dialog.classList.add('is-swapping');
    setTimeout(swap, 120);
    preload(index + 1);
    preload(index - 1);
  }

  function open(i, from) {
    index = i;
    opener = from ?? null;
    render();
    // showModal gives us the focus trap, inertness and Escape for free.
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }

  function move(step) {
    index = (index + step + items.length) % items.length;
    render();
  }

  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    opener?.focus();
  });

  dialog.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') dialog.close();
    else if (act === 'next') move(1);
    else if (act === 'prev') move(-1);
    // Click outside the stage closes — <dialog> treats the backdrop as the
    // dialog itself, so compare against the content box.
    else if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
  });

  // Swipe: horizontal intent only, so vertical scrolling still works.
  let sx = 0;
  let sy = 0;
  dialog.addEventListener('touchstart', (e) => {
    sx = e.changedTouches[0].clientX;
    sy = e.changedTouches[0].clientY;
  }, { passive: true });

  dialog.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
  }, { passive: true });

  frames.forEach((frame, i) => {
    frame.addEventListener('click', () => open(i, frame));
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(i, frame);
      }
    });
  });
}
