/**
 * media.mjs — <picture> construction from the image manifest.
 *
 * Every frame needs an AVIF srcset, a WebP srcset, real width/height and an
 * inlined LQIP — ~15 lines apiece that must stay in lockstep with
 * assets/images/manifest.json. Generating them keeps the gallery in the HTML
 * (crawlable, works with JS off) without the markup drifting from disk.
 */

import { esc } from './shell.mjs';
import { META, slugify } from './content.mjs';

/** Manifest paths are repo-relative; pages render at several depths. */
const abs = (p) => (p.startsWith('/') ? p : '/' + p);

/**
 * `sizes` decides which file a device downloads, and a wrong value fails
 * silently — the page looks identical while the payload multiplies. These are
 * measured against the real rendered boxes: the work grid sits inside
 * `--gutter` padding, so a "full width" frame is ~92vw, never 100vw.
 */
export const SIZES = {
  full: '92vw',
  lead: '(min-width: 768px) 56vw, 92vw',
  sub: '(min-width: 768px) 34vw, 92vw',
  trio: '(min-width: 768px) 30vw, 92vw',
  strip: '(min-width: 768px) 20vw, 26vw',
  // Deliberately understated on small screens: a 3× phone asking for a true
  // 100vw hero pulls the widest file as its LCP. Both hero and signal sit
  // behind heavy scrims with display type over them, so the drop from 3× to
  // ~2.2× density is invisible and the LCP roughly halves.
  hero: '(max-width: 640px) 72vw, 100vw',
  solo: '(min-width: 1024px) 78vw, 94vw',
};

const srcset = (entry, ext) => entry.variants.map((v) => `${abs(v[ext])} ${v.w}w`).join(', ');

/** Mid-ladder variant as the <img src> fallback — never the largest. */
const fallback = (entry) => {
  const v = entry.variants;
  return abs((v.length > 1 ? v[Math.min(1, v.length - 1)] : v[0]).webp);
};

export function picture(entry, meta, { sizes, eager = false, className = 'frame__img' }) {
  const attrs = [
    `class="${className}"`,
    `src="${fallback(entry)}"`,
    `width="${entry.width}"`,
    `height="${entry.height}"`,
    `alt="${esc(meta.alt)}"`,
    `decoding="async"`,
    eager ? `fetchpriority="high"` : `loading="lazy"`,
  ];
  return [
    `<picture>`,
    `  <source type="image/avif" srcset="${srcset(entry, 'avif')}" sizes="${sizes}">`,
    `  <source type="image/webp" srcset="${srcset(entry, 'webp')}" sizes="${sizes}">`,
    `  <img ${attrs.join(' ')}>`,
    `</picture>`,
  ].join('\n');
}

const indent = (s, n) => s.split('\n').map((l) => ' '.repeat(n) + l).join('\n');

/**
 * The LQIP does double duty: as the ratio box's background it holds layout (no
 * CLS), and as the `veil` overlay it is what animates away when the photograph
 * decodes. Fading the veil rather than the full-resolution image is the
 * difference between a smooth resolve and a stuttering one.
 */
export function media(entry, meta, opts, extraClass = '') {
  return [
    `<div class="frame__media${extraClass ? ' ' + extraClass : ''}" style="--ar:${entry.aspect};background-image:url(${entry.lqip})">`,
    indent(picture(entry, meta, opts), 2),
    `  <span class="frame__veil" aria-hidden="true"></span>`,
    `</div>`,
  ].join('\n');
}

/** A gallery frame that links through to its own page. */
export function frame(name, entry, { sizes, size, index }) {
  const meta = META[name];
  const slug = slugify(meta.title);
  return [
    `<figure class="frame frame--${size} reveal" data-idx="${index}" data-name="${name}">`,
    `  <a class="frame__link" href="/work/${slug}/" aria-label="${esc(meta.title)} — open frame">`,
    indent(media(entry, meta, { sizes }), 4),
    `    <figcaption class="frame__cap">`,
    `      <span class="frame__no mono">${String(index).padStart(2, '0')}</span>`,
    `      <span class="frame__title">${esc(meta.title)}</span>`,
    `      <span class="frame__cat mono">Live Music</span>`,
    `    </figcaption>`,
    `  </a>`,
    `</figure>`,
  ].join('\n');
}

/** Row type drives the per-frame size class, which drives `sizes`. */
export function sizeFor(row, i) {
  if (row === 'full') return 'full';
  if (row === 'trio') return 'trio';
  if (row === 'duo-rev') return i === 0 ? 'sub' : 'lead';
  return i === 0 ? 'lead' : 'sub';
}

export function sequence(rows, images, startIndex = 0) {
  let index = startIndex;
  return rows
    .map(({ row, frames }) => {
      const inner = frames
        .map((n, i) => {
          if (!images[n]) throw new Error(`"${n}" is in a sequence but not in the manifest — run \`npm run images\` first.`);
          index += 1;
          const size = sizeFor(row, i);
          return frame(n, images[n], { sizes: SIZES[size] ?? SIZES.full, size, index });
        })
        .join('\n');
      return [`<div class="row row--${row}">`, indent(inner, 2), `</div>`].join('\n');
    })
    .join('\n');
}

export { abs, indent };
