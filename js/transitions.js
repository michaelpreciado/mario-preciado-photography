/**
 * transitions.js — the cut between frames.
 *
 * Clicking a photograph morphs that exact frame into the full-frame page, and
 * reverses on the way back. Cross-document View Transitions do the work; this
 * module's only job is deciding which single element wears the name.
 *
 * Why not a click handler: `pageswap` fires with the destination already
 * resolved, so link clicks, keyboard Enter, and script-driven navigation all
 * take one code path with no guessing about what the visitor did.
 *
 * Why the name is assigned just in time: a view-transition-name must be unique
 * within a document at snapshot time. Naming all eleven grid figures up front
 * is not a shortcut to naming the right one — duplicates abort the transition
 * outright, and eleven unique permanent names would snapshot eleven groups
 * with nothing to match on the far side.
 *
 * The whole feature no-ops for free where it isn't supported: `@view-transition`
 * is an unknown at-rule and gets dropped at parse, and these events never fire.
 * There is nothing to feature-detect and nothing to fall back to — it is just
 * an ordinary navigation.
 */

const NAME = 'mp-frame';
const isSolo = (pathname) => /^\/work\/[^/]+\/$/.test(pathname);

/** Every element this module has ever named, so cleanup can't miss one. */
const named = new Set();

function nameEl(el) {
  if (!el) return;
  el.style.viewTransitionName = NAME;
  named.add(el);
}

function clearNames() {
  for (const el of named) el.style.viewTransitionName = '';
  named.clear();
}

/** The grid figure that links to this path, if we're looking at a grid. */
function frameFor(pathname) {
  const link = document.querySelector(`.work__seq a[href="${pathname}"]`);
  return link?.querySelector('.frame__media') ?? null;
}

export function initTransitions() {
  addEventListener('pageswap', (e) => {
    // Null when the browser decided not to transition — including, by design,
    // under prefers-reduced-motion, because the opt-in at-rule is inside a
    // no-preference query.
    if (!e.viewTransition) return;

    // A lightbox open across a navigation would snapshot a modal that the next
    // page has no idea about.
    document.querySelector('dialog.lb[open]')?.close();

    const to = new URL(e.activation.entry.url).pathname;
    const from = location.pathname;

    if (isSolo(from)) {
      // Solo → solo (the prev/next links) must NOT morph. The two photographs
      // have different aspect ratios, and the transition pseudo-elements render
      // with object-fit: fill — the outgoing frame would visibly stretch into
      // the incoming one's shape. Distorting a photograph is the one thing this
      // whole codebase refuses to do, so the name comes off and the pages
      // simply cross-fade.
      const solo = document.querySelector('.frame__media--solo');
      if (solo) {
        solo.style.viewTransitionName = 'none';
        named.add(solo);
      }
      return;
    }

    if (isSolo(to)) nameEl(frameFor(to));
  });

  addEventListener('pagereveal', (e) => {
    if (!e.viewTransition) {
      clearNames();
      return;
    }

    // Coming back out of a frame page onto a grid: tag the figure we left from
    // so it receives the photograph rather than cross-fading with the page.
    const from = navigation?.activation?.from?.url;
    if (from) {
      const fromPath = new URL(from).pathname;
      if (isSolo(fromPath) && !isSolo(location.pathname)) nameEl(frameFor(fromPath));
    }

    // Cleanup is not optional. A name left behind means the next pageswap adds
    // a second identical one, and a duplicate silently aborts the transition —
    // which presents as "it worked once and then stopped".
    e.viewTransition.finished.finally(clearNames);
  });

  // bfcache restores don't always pair with a transition.
  addEventListener('pagehide', clearNames);
}
