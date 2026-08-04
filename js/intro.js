/**
 * intro.js — the projector.
 *
 * Three beats: the lamp strikes, the focus pulls, the signal locks. Then a
 * shutter opens onto the page. Once per session, home page only, and never
 * when the visitor has asked for reduced motion.
 *
 * Moved out of chrome.js, but the timing discipline is inherited wholesale and
 * it is the part that matters:
 *
 *   The floor exists because the meter tracks the hero decoding, and on a warm
 *   cache that resolves in ~0ms — which snaps the bar to full and reads as
 *   broken rather than fast. The ceiling matters more: a slow connection must
 *   never leave someone watching a progress bar, so it resolves regardless of
 *   whether the image ever arrives.
 *
 * Nothing here can delay the hero. The overlay is a sibling of the page, not a
 * wrapper; the hero's preload and fetchpriority in <head> are untouched; and
 * the exit is two panels moving on transform alone.
 */

import { env, store, imageReady, wait, lockScroll, unlockScroll } from './env.js';

const KEY = 'mp:booted';
const FLOOR = 620;      // desktop
const FLOOR_SM = 420;   // phone — less patience, smaller screen
const CEILING = 1100;

const STAGES = [
  { at: 0, text: 'Warming projector' },
  { at: 0.34, text: 'Pulling focus' },
  { at: 0.72, text: 'Signal lock' },
];

export async function initIntro() {
  const boot = document.getElementById('boot');
  if (!boot) return;

  // Reduced motion skips it outright. `?debug` always replays it.
  // Arriving from elsewhere on the site is also a skip: a projector warm-up on
  // the way back to the home page is an obstacle, not an introduction.
  const seen = store.get(KEY);
  const internal = navigation?.activation?.from != null;
  if (env.reduced || ((seen || internal) && !env.debug)) {
    boot.remove();
    return;
  }

  boot.hidden = false;
  lockScroll();

  const fill = boot.querySelector('.boot__fill');
  const status = boot.querySelector('.boot__status');
  const skip = boot.querySelector('.boot__skip');
  const hero = document.querySelector('.hero__img');

  let done = false;
  let timer = 0;

  const finish = () => {
    if (done) return;
    done = true;
    clearInterval(timer);
    store.set(KEY, '1');
    if (status) status.textContent = 'Ready';
    fill?.style.setProperty('--boot-progress', 1);
    boot.classList.add('is-locking');
    boot.classList.add('is-done');
    unlockScroll();
    // Long enough for the shutter to clear the viewport. If the transition
    // never fires — a background tab, say — the node still goes.
    setTimeout(() => boot.remove(), 720);
  };

  skip?.addEventListener('click', finish);
  addEventListener('keydown', finish, { once: true });

  // Quantised to eighths so the meter ticks like a machine rather than sliding.
  let p = 0;
  let stage = -1;
  timer = setInterval(() => {
    p = Math.min(0.92, p + 0.075);
    fill?.style.setProperty('--boot-progress', Math.round(p * 8) / 8);

    const next = STAGES.findLastIndex((s) => p >= s.at);
    if (next !== stage && next > -1) {
      stage = next;
      if (status) status.textContent = STAGES[next].text;
    }
  }, 90);

  const floor = innerWidth < 768 ? FLOOR_SM : FLOOR;
  await Promise.race([
    Promise.all([imageReady(hero), wait(floor)]),
    wait(CEILING),
  ]);

  finish();
}
