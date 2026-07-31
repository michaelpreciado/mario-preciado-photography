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

const chrome = () => `<div class="hud" aria-hidden="true">
  <span class="hud__corner hud__corner--tl"></span>
  <span class="hud__corner hud__corner--tr"></span>
  <span class="hud__corner hud__corner--bl"></span>
  <span class="hud__corner hud__corner--br"></span>
  <div class="hud__progress"><span class="hud__progress-fill"></span></div>
</div>
<div class="scanlines" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>

<a href="#main" class="skip-link">Skip to content</a>`;

const boot = () => `<div id="boot" class="boot" aria-hidden="true" hidden>
  <div class="boot__inner">
    <p class="boot__word" data-text="${SITE.name.toUpperCase()}">${SITE.name.toUpperCase()}</p>
    <div class="boot__bar"><span class="boot__fill"></span></div>
    <p class="boot__status">Loading</p>
  </div>
  <button class="boot__skip" type="button">Skip</button>
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
  <p class="mono">&copy; <span id="year">2026</span> ${SITE.name} Photography</p>
  <p class="mono foot__made">${SITE.location}</p>
  <a class="foot__ig" href="${SITE.instagram}" target="_blank" rel="noopener noreferrer" aria-label="${SITE.name} on Instagram">${ICON_INSTAGRAM}</a>
</footer>`;

/** Assemble a complete document. */
export function page({ title, description, canonical, ogImage, ogType, jsonLd, bodyClass = '', main, preloadHero }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
${head({ title, description, canonical, ogImage, ogType, jsonLd, preloadHero })}
</head>

<body${bodyClass ? ` class="${bodyClass}"` : ''}>

${boot()}

${chrome()}

${nav(canonical)}

<main id="main">
${main}
</main>

${footer()}

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
