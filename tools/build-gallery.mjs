#!/usr/bin/env node
/**
 * build-gallery.mjs — writes the <picture> markup into index.html.
 *
 *   npm run gallery
 *
 * Why generate rather than hand-write: each frame needs an AVIF srcset, a WebP
 * srcset, real width/height and an inlined LQIP — roughly 15 lines apiece that
 * must stay in lockstep with assets/images/manifest.json. Generating it keeps
 * the gallery in the HTML (crawlable, works with JS disabled) without the
 * markup drifting from the actual files on disk.
 *
 * Only the regions between `<!-- gallery:<name>:start -->` and
 * `<!-- gallery:<name>:end -->` are touched; everything else in index.html is
 * hand-authored and preserved.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML = path.join(ROOT, 'index.html');
const MANIFEST = path.join(ROOT, 'assets', 'images', 'manifest.json');

/**
 * Alt text is written from looking at each photograph — it describes the frame
 * for someone who can't see it. The previous copy ("Live Music 001") named the
 * file, not the image, which is no use to a screen reader.
 */
const META = {
  'hero-001':      { title: 'Blue Room',           alt: 'Musician in a bucket hat and glasses playing a synth rig beneath a blue and magenta liquid light projection.' },
  'hero-002':      { title: 'Amber Hour',          alt: 'Singer at the microphone behind a blue keyboard, lit in warm amber and olive stage light.' },
  'portfolio_001': { title: 'Liquid Light',        alt: 'Band on stage under a psychedelic green and magenta liquid light projection, guitarist at the microphone.' },
  'portfolio_002': { title: 'Tinsel',              alt: 'Vocalist in a patterned dress arching backward mid-note in front of a silver tinsel curtain, drummer behind.' },
  'portfolio_003': { title: 'Crowd Motion',        alt: 'Crowd surfer carried on raised hands through a packed audience under blue stage light.' },
  'portfolio_004': { title: 'Red Kit',             alt: 'Drummer mid-set drenched in deep red stage light, cymbals catching the glow.' },
  'portfolio_005': { title: 'Lead Vocalist',       alt: 'Guitarist leaning into the microphone in profile, violet rim light across a white electric guitar.' },
  'portfolio_006': { title: 'Reach',               alt: 'Vocalist in a floral dress holding the microphone stand overhead against a tinsel backdrop.' },
  'portfolio_007': { title: 'Solar',               alt: 'Lone performer silhouetted against a giant glowing orange orb backdrop in a red-washed room.' },
  'portfolio_008': { title: 'Main Stage',          alt: 'Wide venue shot — an arched stage set in blue light and smoke, audience silhouetted in the foreground.' },
  'portfolio_009': { title: 'Raw Energy',          alt: 'Guitarist in a black cowboy hat and fringed jacket playing against a fiery orange backdrop.' },
  'portfolio_010': { title: 'Wide Brim',           alt: 'Long-haired guitarist in a wide-brimmed hat singing at the microphone under warm amber light.' },
  'portfolio_011': { title: 'Green Room',          alt: 'Guitarist with a hollow-body electric bathed in deep green stage light.' },
};

/**
 * The editorial rhythm. Alternating scale is what stops a photo gallery reading
 * as a contact sheet — full-bleed singles to breathe, unequal pairs for
 * tension, one triptych as a change of pace.
 */
const SEQUENCE = [
  { row: 'full',    frames: ['portfolio_003'] },
  { row: 'duo',     frames: ['portfolio_001', 'portfolio_007'] },
  { row: 'full',    frames: ['portfolio_008'] },
  { row: 'trio',    frames: ['portfolio_009', 'portfolio_011', 'portfolio_005'] },
  { row: 'duo-rev', frames: ['portfolio_002', 'portfolio_006'] },
  { row: 'duo',     frames: ['portfolio_010', 'portfolio_004'] },
];

/**
 * Two squares then a wide print. The third slot is cropped to 16:10, so it has
 * to be a natively landscape frame — a 1280×1918 portrait cropped that hard
 * loses its subject entirely. All three are from the amber cluster, which is
 * what makes the strip read as one set rather than three spare photos.
 */
const ABOUT_STRIP = ['portfolio_007', 'portfolio_009', 'portfolio_010'];

/**
 * `sizes` decides which file a device actually downloads, and a wrong value
 * fails silently — the page looks identical while the payload multiplies.
 * These are measured against the real rendered boxes, not guessed: the work
 * grid sits inside `--gutter` padding, so a "full width" frame is ~92vw, never
 * 100vw. Only the hero and signal are genuinely edge to edge.
 */
const SIZES = {
  full: '92vw',
  lead: '(min-width: 768px) 56vw, 92vw',
  sub: '(min-width: 768px) 34vw, 92vw',
  trio: '(min-width: 768px) 30vw, 92vw',
  strip: '(min-width: 768px) 20vw, 26vw',
  /* Deliberately understated on small screens. A 3× phone asking for a true
     100vw hero pulls the 1280 file (~330KB) as its LCP; at 72vw it takes the
     960 instead. Both sit behind a heavy scrim with display type over them, so
     the drop from 3× to ~2.2× density is invisible and the LCP roughly halves. */
  hero: '(max-width: 640px) 72vw, 100vw',
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function srcset(entry, ext) {
  return entry.variants.map((v) => `${v[ext]} ${v.w}w`).join(', ');
}

/** Mid-ladder variant as the <img src> fallback — never the largest. */
function fallback(entry) {
  const v = entry.variants;
  return (v.length > 1 ? v[Math.min(1, v.length - 1)] : v[0]).webp;
}

function picture(entry, meta, { sizes, loading = 'lazy', fetchpriority, className = 'frame__img' }) {
  const attrs = [
    `class="${className}"`,
    `src="${fallback(entry)}"`,
    `width="${entry.width}"`,
    `height="${entry.height}"`,
    `alt="${esc(meta.alt)}"`,
    `decoding="async"`,
    loading === 'eager' ? null : `loading="lazy"`,
    fetchpriority ? `fetchpriority="${fetchpriority}"` : null,
  ].filter(Boolean);

  return [
    `<picture>`,
    `  <source type="image/avif" srcset="${srcset(entry, 'avif')}" sizes="${sizes}">`,
    `  <source type="image/webp" srcset="${srcset(entry, 'webp')}" sizes="${sizes}">`,
    `  <img ${attrs.join(' ')}>`,
    `</picture>`,
  ].join('\n');
}

function media(entry, meta, opts, extraClass = '') {
  // LQIP rides as a background on the ratio box: it holds the layout (no CLS),
  // then renders as visible 8-bit blocks under image-rendering: pixelated until
  // the real frame decodes. One mechanism doing both jobs.
  return [
    `<div class="frame__media${extraClass ? ' ' + extraClass : ''}" style="--ar:${entry.aspect};background-image:url(${entry.lqip})">`,
    indent(picture(entry, meta, opts), 2),
    `</div>`,
  ].join('\n');
}

const indent = (s, n) => s.split('\n').map((l) => ' '.repeat(n) + l).join('\n');

function frame(name, entry, meta, { sizes, size, index }) {
  const largest = entry.variants[entry.variants.length - 1];
  return [
    `<figure class="frame frame--${size} reveal" data-idx="${index}" data-name="${name}"`,
    `        data-full="${largest.webp}" data-full-avif="${largest.avif}"`,
    `        data-title="${esc(meta.title)}" data-alt="${esc(meta.alt)}" tabindex="0" role="button"`,
    `        aria-label="Open ${esc(meta.title)} full size">`,
    indent(media(entry, meta, { sizes }), 2),
    `  <figcaption class="frame__cap">`,
    `    <span class="frame__no mono">${String(index).padStart(2, '0')}</span>`,
    `    <span class="frame__title">${esc(meta.title)}</span>`,
    `    <span class="frame__cat mono">Live Music</span>`,
    `  </figcaption>`,
    `</figure>`,
  ].join('\n');
}

function build(images) {
  const get = (n) => {
    if (!images[n]) throw new Error(`"${n}" is in the sequence but not in the manifest — run \`npm run images\` first.`);
    return images[n];
  };

  // ── hero ──
  const heroName = 'hero-001';
  const hero = media(get(heroName), META[heroName], { sizes: SIZES.hero, loading: 'eager', fetchpriority: 'high', className: 'hero__img' }, 'frame__media--fill');

  // ── signal ──
  const sigName = 'hero-002';
  const signal = media(get(sigName), META[sigName], { sizes: SIZES.hero, className: 'signal__img' }, 'frame__media--fill');

  // ── work sequence ──
  let index = 0;
  const rows = SEQUENCE.map(({ row, frames }) => {
    const inner = frames
      .map((n, i) => {
        index += 1;
        const size = row === 'full' ? 'full' : row === 'trio' ? 'trio' : i === 0 ? (row === 'duo-rev' ? 'sub' : 'lead') : row === 'duo-rev' ? 'lead' : 'sub';
        return frame(n, get(n), META[n], { sizes: SIZES[size] ?? SIZES.full, size, index });
      })
      .join('\n');
    return [`<div class="row row--${row}">`, indent(inner, 2), `</div>`].join('\n');
  }).join('\n');

  // ── about contact strip ──
  const strip = ABOUT_STRIP.map((n, i) => {
    const e = get(n);
    return [
      `<div class="strip__item reveal" style="--i:${i}">`,
      indent(media(e, META[n], { sizes: SIZES.strip }), 2),
      `</div>`,
    ].join('\n');
  }).join('\n');

  return { hero, signal, work: rows, about: strip, count: index };
}

function inject(html, name, body) {
  const start = `<!-- gallery:${name}:start -->`;
  const end = `<!-- gallery:${name}:end -->`;
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!re.test(html)) throw new Error(`markers for "${name}" not found in index.html`);
  return html.replace(re, `${start}\n${body}\n${end}`);
}

async function main() {
  const { images } = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const missing = Object.keys(META).filter((k) => !images[k]);
  if (missing.length) {
    console.error(`✗ manifest is missing: ${missing.join(', ')} — run \`npm run images\``);
    process.exit(1);
  }

  const built = build(images);
  let html = await readFile(HTML, 'utf8');
  html = inject(html, 'hero', built.hero);
  html = inject(html, 'signal', built.signal);
  html = inject(html, 'work', built.work);
  html = inject(html, 'about', built.about);
  await writeFile(HTML, html);

  console.log(`\n  Gallery written into index.html`);
  console.log(`  ${built.count} frames across ${SEQUENCE.length} rows · hero + signal + ${ABOUT_STRIP.length}-up contact strip`);
  console.log(`  every frame carries avif+webp srcset, real width/height, and an inlined LQIP\n`);
}

main().catch((err) => {
  console.error('\n✗ build-gallery failed:', err.message);
  process.exit(1);
});
