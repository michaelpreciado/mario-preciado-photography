/**
 * shell.mjs — the chrome every page shares.
 *
 * Nav, HUD, footer and <head> are defined once here. On a multi-page static
 * site the alternative is copying them into each file, which guarantees they
 * drift the first time one gets edited.
 *
 * All asset paths are root-absolute (`/css/…`), because these templates render
 * at `/`, `/work/` and `/work/<slug>/` alike — relative paths would resolve
 * differently at each depth.
 */

import { SITE, NAV } from './content.mjs';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'%3E%3Crect width='16' height='16' fill='%23000'/%3E%3Cpath fill='%23ff10f0' d='M5 2h6v2H5zM3 4h2v2H3zm8 0h2v2h-2zM2 6h2v4H2zm10 0h2v4h-2zM3 10h2v2H3zm8 0h2v2h-2zM5 12h6v2H5z'/%3E%3Crect x='7' y='7' width='2' height='2' fill='%23ffb020'/%3E%3C/svg%3E";

export const ICON_INSTAGRAM = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;

export const ICON_ARROW = `<svg class="sprite" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 7h8V5h2v2h2v2h-2v2h-2V9H2V7z"/></svg>`;
export const ICON_ARROW_L = `<svg class="sprite" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M14 7H6V5H4v2H2v2h2v2h2V9h8V7z"/></svg>`;
export const ICON_CHEVRON = `<svg class="sprite" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M7 2h2v8h2v2H9v2H7v-2H5v-2h2V2zM3 8h2v2H3V8zm8 0h2v2h-2V8z"/></svg>`;
export const ICON_CLOSE = `<svg class="sprite" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 2h2v2H3V2zm2 2h2v2H5V4zm2 2h2v2H7V6zm2-2h2v2H9V4zm2-2h2v2h-2V2zM9 8h2v2H9V8zm2 2h2v2h-2v-2zm2 2h2v2h-2v-2zM7 8h2v2H7V8zm-2 2h2v2H5v-2zm-2 2h2v2H3v-2zM1 14h2v2H1v-2zm12 0h2v2h-2v-2zM1 0h2v2H1V0zm12 0h2v2h-2V0z"/></svg>`;
export const ICON_EXPAND = `<svg class="sprite" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 2h5v2H4v3H2V2zm7 0h5v5h-2V4H9V2zM2 9h2v3h3v2H2V9zm10 0h2v5H9v-2h3V9z"/></svg>`;

function head({ title, description, canonical, ogImage, ogType = 'website', jsonLd, preloadHero }) {
  const url = SITE.origin + canonical;
  const img = ogImage ? (ogImage.startsWith('http') ? ogImage : SITE.origin + ogImage) : `${SITE.origin}/assets/images/hero-001.webp`;
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#000000">

<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${SITE.name}">
<link rel="canonical" href="${url}">
<link rel="icon" href="${FAVICON}">

<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${img}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${SITE.name} Photography">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${img}">

<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>

<!-- crossorigin is REQUIRED on font preloads even same-origin, or each file is fetched twice -->
<link rel="preload" href="/assets/fonts/anton-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${preloadHero ? `<link rel="preload" as="image" href="${preloadHero.href}" imagesrcset="${preloadHero.srcset}" imagesizes="${preloadHero.sizes}" fetchpriority="high">\n` : ''}<link rel="stylesheet" href="/css/style.css">

<!-- Marks JS alive BEFORE first paint so progressive-enhancement styles only
     apply when something can actually reveal the content. -->
<script>document.documentElement.classList.add('js');</script>

<script type="module" src="/js/main.js"></script>`;
}

/**
 * The projection layer — the room the whole site sits in.
 *
 * Three "wheels" standing in for the oil-wheel projectors these photographs
 * were shot under. Each is a single element carrying a soft radial gradient
 * and a slow transform drift; the softness is baked into the gradient's colour
 * stops rather than applied with filter: blur(), because blurring a
 * viewport-sized layer on every frame is the one thing here that would
 * actually cost frames on a phone.
 *
 * The hue of all three rotates together as sections come into view — the gel
 * change. See RIG in content.mjs for the cue sheet.
 */
const rig = () => `<div class="rig" aria-hidden="true">
  <span class="rig__wheel rig__wheel--a"></span>
  <span class="rig__wheel rig__wheel--b"></span>
  <span class="rig__wheel rig__wheel--c"></span>
  <span class="rig__haze"></span>
</div>`;

/**
 * The truss — a hairline frame with the lighting desk's readout on it.
 *
 * Everything in here is decorative and marked so: it repeats state that is
 * already conveyed by the page itself (which section you are in, how far down
 * you are), so announcing it would be noise.
 */
const chrome = () => `<div class="hud" aria-hidden="true">
  <span class="hud__corner hud__corner--tl"></span>
  <span class="hud__corner hud__corner--tr"></span>
  <span class="hud__corner hud__corner--bl"></span>
  <span class="hud__corner hud__corner--br"></span>
  <div class="hud__progress"><span class="hud__progress-fill"></span></div>
  <div class="hud__rail">
    <span class="hud__ticks"></span>
    <span class="hud__ch mono">CH <b class="hud__ch-n">01</b> <i>·</i> <b class="hud__ch-gel">LIQUID</b> <i>·</i> <b class="hud__ch-k">3200K</b></span>
  </div>
  <div class="hud__meter"><span class="hud__meter-fill"></span></div>
</div>
<div class="scanlines" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>

<a href="#main" class="skip-link">Skip to content</a>`;

/**
 * Projector intro — three beats: lamp strikes, focus pulls, signal locks.
 *
 * Runs once per session and never on a reduced-motion setting. The wordmark is
 * a real element rather than an image so nothing extra is fetched, and the
 * whole overlay is a sibling of the page rather than a wrapper, so it can never
 * hold up the hero's decode or the LCP.
 */
const boot = () => `<div id="boot" class="boot" role="dialog" aria-label="Intro sequence" hidden>
  <span class="boot__lamp" aria-hidden="true"></span>
  <div class="boot__inner" aria-hidden="true">
    <p class="boot__word" data-text="${SITE.name.toUpperCase()}">${SITE.name.toUpperCase()}</p>
    <div class="boot__bar"><span class="boot__fill"></span></div>
    <p class="boot__status mono">Warming projector</p>
  </div>
  <button class="boot__skip" type="button">Skip intro</button>
  <span class="boot__shutter boot__shutter--t" aria-hidden="true"></span>
  <span class="boot__shutter boot__shutter--b" aria-hidden="true"></span>
</div>`;

function nav(current) {
  const links = NAV.map(
    (n) =>
      `    <a href="${n.href}"${n.href === current ? ' aria-current="page"' : ''}><span class="nav__idx" aria-hidden="true">${n.idx}</span>${n.label.toUpperCase()}</a>`
  ).join('\n');
  return `<header class="nav">
  <a class="nav__mark" href="/" aria-label="${SITE.name} — home">
    <span class="nav__dot" aria-hidden="true"></span>
    <span class="nav__name glitch" data-text="${SITE.name.toUpperCase()}">${SITE.name.toUpperCase()}</span>
  </a>

  <nav id="nav-links" class="nav__links" aria-label="Primary">
${links}
  </nav>

  <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Open menu">
    <span class="nav__toggle-bar"></span>
    <span class="nav__toggle-bar"></span>
  </button>
</header>`;
}

const footer = () => `<footer class="foot">
  <p class="foot__mega" aria-hidden="true">${SITE.name}</p>
  <p class="mono">&copy; <span id="year">2026</span> ${SITE.name} Photography</p>
  <p class="mono foot__made">${SITE.location}</p>
  <a class="foot__ig" href="${SITE.instagram}" target="_blank" rel="noopener noreferrer" aria-label="${SITE.name} on Instagram">${ICON_INSTAGRAM}</a>
</footer>`;

/**
 * The lightbox shell — empty on purpose.
 *
 * A native <dialog> rather than a hand-built overlay: showModal() gives the
 * focus trap, Escape, the inert background and the top layer for free, and
 * every one of those is a thing that gets subtly wrong when hand-rolled. The
 * stage is filled at open time by cloning the grid's own <picture>, so no
 * second copy of the image ladder is shipped in the HTML.
 */
const lightbox = () => `<dialog id="lb" class="lb" aria-label="Full screen frame">
  <div class="lb__stage"></div>
  <p class="lb__meta mono" role="status" aria-live="polite"></p>
  <button class="lb__nav lb__nav--prev" type="button" aria-label="Previous frame">${ICON_ARROW_L}</button>
  <button class="lb__nav lb__nav--next" type="button" aria-label="Next frame">${ICON_ARROW}</button>
  <button class="lb__close" type="button" aria-label="Close">${ICON_CLOSE}</button>
</dialog>`;

/**
 * Assemble a complete document.
 *
 * `gel` seeds the projection layer's hue for pages that have no scrollable
 * section cue sheet of their own — a single-frame page adopts the gel of the
 * photograph it shows, so the room is already the right colour before any
 * script runs.
 *
 * `intro` and `hasLightbox` keep those two blocks off the pages that have no
 * use for them: a projector warm-up before /contact/ is an obstacle, and a
 * dialog on a page with no photographs is dead markup.
 */
export function page({
  title, description, canonical, ogImage, ogType, jsonLd,
  bodyClass = '', main, preloadHero, gel = 0, intro = false, hasLightbox = false,
}) {
  const bodyAttrs = [bodyClass ? `class="${bodyClass}"` : '', `style="--gel:${gel}deg"`].filter(Boolean).join(' ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
${head({ title, description, canonical, ogImage, ogType, jsonLd, preloadHero })}
</head>

<body ${bodyAttrs}>
${intro ? `\n${boot()}\n` : ''}
${rig()}

${chrome()}

${nav(canonical)}

<main id="main">
${main}
</main>

${footer()}
${hasLightbox ? `\n${lightbox()}\n` : ''}
</body>
</html>
`;
}

/** Person schema, shared by the pages that aren't about a single photograph. */
export const personSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE.name,
  jobTitle: SITE.role,
  description: `Bay Area photographer specialising in live music, street, fashion, portraiture, art culture and community.`,
  url: SITE.origin + '/',
  email: SITE.email,
  image: `${SITE.origin}/assets/images/hero-001.webp`,
  sameAs: [SITE.instagram],
  address: { '@type': 'PostalAddress', addressRegion: 'CA', addressCountry: 'US', addressLocality: 'Bay Area' },
  knowsAbout: ['Live music photography', 'Concert photography', 'Street photography', 'Portraiture', 'Fashion photography'],
});
