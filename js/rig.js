/**
 * rig.js — the lighting cues.
 *
 * Scrolling into a section is a cue. The projection layer rotates to that
 * section's gel, the HUD readout ticks over to its channel, and the heading
 * takes a single RGB-split hit as the change lands.
 *
 * Almost nothing happens here per frame. The cue sheet is serialised onto each
 * section as data attributes by the build (see RIG in tools/lib/content.mjs),
 * so this reads them off the element rather than carrying a second copy of the
 * same table; and all it writes is one custom property, only when the value it
 * would write actually changed.
 */

import { env } from './env.js';
import { observeSections } from './chrome.js';
import { set } from './debug.js';

export function initRig() {
  const rig = document.querySelector('.rig');
  if (!rig) return;

  const chN = document.querySelector('.hud__ch-n');
  const chGel = document.querySelector('.hud__ch-gel');
  const chK = document.querySelector('.hud__ch-k');

  let lastHue = null;

  observeSections((section) => {
    const { ch, gel, k, hue } = section.dataset;

    // A section with no cue leaves the room as it is. Better than snapping to
    // a default, which would read as a light being knocked rather than faded.
    if (hue === undefined) return;

    const next = `${hue}deg`;
    if (next !== lastHue) {
      lastHue = next;
      // On <body>, because that is where the build seeds the initial value and
      // .rig inherits it. The CSS transition on filter does the fade.
      document.body.style.setProperty('--gel', next);
    }

    if (chN && ch) chN.textContent = ch;
    if (chGel && gel) chGel.textContent = gel.toUpperCase();
    if (chK && k) chK.textContent = k;

    // The heading takes the hit, not the photographs. Remove/reflow/add is the
    // standard restart idiom — without the reflow the class is added back in
    // the same frame it was removed and the animation never re-runs.
    if (!env.reduced) {
      const title = section.querySelector('.sec-title, .hero__title, .signal__title, .solo__title');
      if (title) {
        title.classList.remove('is-gelled');
        void title.offsetWidth;
        title.classList.add('is-gelled');
      }
    }

    set('gel', `${ch ?? '--'} ${gel ?? ''}`);
  });
}
