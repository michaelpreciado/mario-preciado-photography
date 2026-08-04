/**
 * filter.js — polish on top of a filter that already works.
 *
 * The filtering itself is CSS: a radio group, `:has()`, and `[data-light~=…]`
 * (see §25 of the stylesheet). With JavaScript disabled the chips still filter
 * the archive. That is not a degraded mode, it is the mechanism.
 *
 * What this adds is the animated re-layout, the URL state so a filtered view
 * can be linked, an announcement for screen readers, and keeping the lightbox's
 * arrow order in step with what is actually visible.
 */

import { env } from './env.js';
import { setLightboxSet } from './lightbox.js';

export function initFilter() {
  const section = document.querySelector('.work--index');
  const chips = section?.querySelector('.filter__chips');
  if (!section || !chips) return;

  const status = section.parentElement?.querySelector('.filter__status')
    ?? document.querySelector('.filter__status');
  const seq = section.querySelector('.work__seq');
  const all = [...seq.querySelectorAll('.frame')];

  /**
   * The reveal observer unobserves each element once it has fired, and a
   * display:none element never intersects at all. So a frame that was filtered
   * out before it was ever scrolled to would come back permanently invisible.
   *
   * Showing every frame up front the first time a chip is touched costs one
   * class write each and removes the entire failure mode. A missing entrance
   * animation is nothing; a missing photograph is the whole site.
   */
  let settled = false;
  const settleReveals = () => {
    if (settled) return;
    settled = true;
    all.forEach((f) => f.classList.add('is-in'));
  };

  const visible = () => all.filter((f) => f.offsetParent !== null);

  const apply = (value) => {
    const shown = visible();
    setLightboxSet(shown.length ? shown : all);

    if (status) {
      const label = chips.querySelector(`#f-${value}`)?.nextElementSibling
        ?.querySelector('.filter__label')?.textContent ?? 'All';
      status.textContent = `${shown.length} ${shown.length === 1 ? 'frame' : 'frames'} — ${label}`;
    }

    // Linkable, and survives a reload. replaceState rather than pushState:
    // filtering a gallery is not a destination, and stacking history entries
    // makes the back button walk chip by chip instead of leaving the page.
    const url = value === 'all' ? location.pathname : `${location.pathname}?light=${value}`;
    history.replaceState(null, '', url);
  };

  chips.addEventListener('change', (e) => {
    const input = e.target.closest('.filter__in');
    if (!input) return;

    settleReveals();

    // startViewTransition is FLIP for free — the browser measures both states
    // itself, so no getBoundingClientRect batch and no layout thrash. Where it
    // isn't available the CSS has already switched instantly, which is a
    // perfectly good outcome and exactly what reduced motion gets anyway.
    if (env.reduced || !document.startViewTransition) {
      apply(input.value);
      return;
    }

    document.startViewTransition(() => apply(input.value));
  });

  // Restore from the URL on load. No transition here — animating a layout the
  // visitor has not seen yet is just a delay before the page appears.
  const wanted = new URLSearchParams(location.search).get('light');
  if (wanted) {
    const input = chips.querySelector(`#f-${CSS.escape(wanted)}`);
    if (input) {
      input.checked = true;
      settleReveals();
      apply(wanted);
    }
  }
}
