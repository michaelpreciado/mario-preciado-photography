#!/usr/bin/env node
/**
 * build-site.mjs — generates every page of the site.
 *
 *   npm run site
 *
 * Replaces the old marker-injection approach in build-gallery.mjs. Once the
 * site has per-photograph pages, patching regions of a hand-written index.html
 * stops scaling: nav and footer would have to be duplicated into every file and
 * would drift the first time one was edited. Everything now renders from
 * tools/lib/shell.mjs + content.mjs, so the chrome exists once.
 *
 * Output (all static, no build step at serve time):
 *   /index.html
 *   /work/index.html
 *   /work/<slug>/index.html   — one per photograph
 *   /about/index.html
 *   /contact/index.html
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE, COPY, META, GELS, RIG, SEQUENCE, HOME_SEQUENCE, HERO, SIGNAL, ABOUT_STRIP, gel, slugify } from './lib/content.mjs';
import { page, personSchema, esc, ICON_ARROW, ICON_ARROW_L, ICON_CHEVRON } from './lib/shell.mjs';
import { media, picture, sequence, SIZES, indent, abs } from './lib/media.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'assets', 'images', 'manifest.json');

// ── shared blocks ────────────────────────────────────────────────────────────

const eyebrow = (text, idx) =>
  `<p class="eyebrow">${idx ? `<span class="eyebrow__idx" aria-hidden="true">${idx}</span>` : `<span class="eyebrow__pip" aria-hidden="true"></span>`}${esc(text)}</p>`;

const secTitle = ([plain, accent]) =>
  `<h2 class="sec-title reveal">${esc(plain)}<br><em>${esc(accent)}</em></h2>`;

/**
 * Serialise a section's lighting cue onto the section itself.
 *
 * The alternative is a lookup table in JS keyed by section id, which is the
 * same data written twice and guaranteed to drift the first time a section is
 * renamed. This way content.mjs stays the only place the cue sheet exists.
 */
const rigCue = (key) => {
  const r = RIG[key];
  return r ? ` data-ch="${r.ch}" data-gel="${esc(r.gel)}" data-k="${r.k}" data-hue="${r.hue}"` : '';
};

function ticker() {
  const run = (hidden) =>
    `      <ul class="ticker__run"${hidden ? ' aria-hidden="true"' : ''}>\n        ${SITE.disciplines
      .map((d) => `<li>${esc(d)}</li>`)
      .join('')}\n      </ul>`;
  return `  <div class="ticker">
    <div class="ticker__track">
${run(false)}
${run(true)}
${run(true)}
    </div>
  </div>`;
}

function brand() {
  return `  <section class="brand" aria-label="${SITE.name}">
    <div class="brand__stack" aria-hidden="true">
      ${'<span class="record"></span>'.repeat(5)}
    </div>
    <div class="brand__caption">
      <p class="brand__name">${esc(SITE.name)}</p>
      <p class="brand__role mono">${esc(SITE.role)} &nbsp;·&nbsp; ${esc(SITE.location)}</p>
    </div>
  </section>`;
}

function hero(images) {
  const e = images[HERO];
  const [a, b, c] = COPY.hero.title;
  return `  <section id="home" class="hero" aria-label="Introduction"${rigCue('home')}>
    <div class="hero__media parallax" data-parallax="0.18">
${indent(media(e, META[HERO], { sizes: SIZES.hero, eager: true, className: 'hero__img' }, 'frame__media--fill'), 6)}
      <div class="hero__scrim" aria-hidden="true"></div>
    </div>

    <div class="hero__body">
      ${eyebrow(COPY.hero.eyebrow)}
      <h1 class="hero__title">${esc(a)}<br><em>${esc(b)}</em><br>${esc(c)}<span class="hero__stop" aria-hidden="true">.</span></h1>
      <p class="hero__lede">${esc(COPY.hero.lede)}</p>
    </div>

    <div class="hero__meta" aria-hidden="true">
      <span class="mono">${SITE.coords}</span>
      <span class="mono hero__count"></span>
    </div>

    <a class="hero__scroll" href="#work" aria-label="Scroll to selected work">
      <span class="mono">Scroll</span>
      ${ICON_CHEVRON}
    </a>
  </section>`;
}

function signal(images) {
  const e = images[SIGNAL];
  const [a, b] = COPY.signal.title;
  return `  <section id="signal" class="signal" aria-label="Featured capture"${rigCue('signal')}>
    <div class="signal__media parallax" data-parallax="0.12">
${indent(media(e, META[SIGNAL], { sizes: SIZES.hero, className: 'signal__img' }, 'frame__media--fill'), 6)}
      <div class="signal__scrim" aria-hidden="true"></div>
    </div>
    <div class="signal__body">
      ${eyebrow(COPY.signal.eyebrow, '03')}
      <h2 class="signal__title">${esc(a)}<br><em>${esc(b)}</em></h2>
      <p class="signal__meta mono">${esc(META[SIGNAL].title)} &nbsp;·&nbsp; ${esc(gel(META[SIGNAL].light[0]).label)} &nbsp;·&nbsp; Bay Area, CA</p>
    </div>
  </section>`;
}

/**
 * Six services in a bordered grid. Each cell is a channel strip: index, name,
 * a subject line, and one sentence. No prices — see COPY.services.
 */
function services() {
  const c = COPY.services;
  const items = c.items
    .map(
      (s, i) => `        <li class="svc reveal" style="--i:${i}">
          <span class="svc__no mono" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="svc__name">${esc(s.name)}</h3>
          <p class="svc__tag mono">${esc(s.tag)}</p>
          <p class="svc__line">${esc(s.line)}</p>
        </li>`
    )
    .join('\n');

  return `  <section id="services" class="services" aria-label="Services"${rigCue('services')}>
    <header class="sec-head">
      ${eyebrow(c.eyebrow, '04')}
      ${secTitle(c.title)}
      <p class="sec-note mono reveal">${esc(c.note)}</p>
    </header>

    <ul class="svc-grid">
${items}
    </ul>
  </section>`;
}

/** Four steps, drawn as a signal chain across the page. */
function processBlock() {
  const c = COPY.process;
  const steps = c.steps
    .map(
      (s, i) => `        <li class="step reveal" style="--i:${i}">
          <span class="step__no mono" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="step__name">${esc(s.name)}</h3>
          <p class="step__line">${esc(s.line)}</p>
        </li>`
    )
    .join('\n');

  return `  <section id="process" class="process" aria-label="Process"${rigCue('process')}>
    <header class="sec-head">
      ${eyebrow(c.eyebrow, '05')}
      ${secTitle(c.title)}
    </header>

    <ol class="step-chain">
${steps}
    </ol>
  </section>`;
}

function aboutBlock(images, { full = false } = {}) {
  const strip = ABOUT_STRIP.map((n, i) =>
    [
      `<div class="strip__item reveal" style="--i:${i}">`,
      indent(media(images[n], META[n], { sizes: SIZES.strip }), 2),
      `</div>`,
    ].join('\n')
  ).join('\n');

  const lines = COPY.about.bio
    .map(
      (l) =>
        `            <p class="about__line${l.em ? ' about__line--em' : ''}">${l.prompt ? '<span class="mono about__prompt" aria-hidden="true">—</span> ' : ''}${l.html}</p>`
    )
    .join('\n');

  const stats = COPY.about.stats
    .map((s) => `          <li><span class="stats__n">${esc(s.n)}</span><span class="stats__k mono">${esc(s.k)}</span></li>`)
    .join('\n');

  return `  <section id="about" class="about" aria-label="About ${SITE.name}"${rigCue('about')}>
    <header class="sec-head">
      ${eyebrow(COPY.about.eyebrow, '06')}
      ${full ? secTitle(COPY.about.title) : ''}
    </header>

    <div class="about__grid">
      <div class="about__panel reveal">
        <div class="panel">
          <span class="panel__bar mono" aria-hidden="true">
            <span class="panel__dots"><i></i><i></i><i></i></span>
            ${esc(SITE.name)} — Bay Area, CA
          </span>
          <div class="panel__body">
${lines}
          </div>
        </div>

        <ul class="stats" aria-label="At a glance">
${stats}
        </ul>

        <div class="about__cta">
          <a class="btn" href="/contact/"><span>Get in touch</span>${ICON_ARROW}</a>
          <a class="btn btn--ghost" href="${SITE.instagram}" target="_blank" rel="noopener noreferrer"><span>${esc(SITE.instagramHandle)}</span></a>
        </div>
      </div>

      <div class="about__stack">
${indent(strip, 8)}
      </div>
    </div>
  </section>`;
}

function contactBlock() {
  const f = COPY.contact;
  return `  <section id="contact" class="contact" aria-label="Contact"${rigCue('contact')}>
    <header class="sec-head">
      ${eyebrow(f.eyebrow, '07')}
      ${secTitle(f.title)}
    </header>

    <div class="contact__grid">
      <div class="contact__aside reveal">
        <p class="contact__pitch">${esc(f.pitch)}</p>
        <dl class="contact__list mono">
          <div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
          <div><dt>Instagram</dt><dd><a href="${SITE.instagram}" target="_blank" rel="noopener noreferrer">${esc(SITE.instagramHandle)}</a></dd></div>
          <div><dt>Based</dt><dd>${esc(SITE.location)}</dd></div>
        </dl>
      </div>

      <form id="contact-form" class="form reveal" action="${SITE.formspree}" method="POST" novalidate>
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" class="form__gotcha">

        <div class="field">
          <label for="name" class="mono">Name</label>
          <input id="name" name="name" type="text" required autocomplete="name" placeholder="Your name">
        </div>
        <div class="field">
          <label for="email" class="mono">Email</label>
          <input id="email" name="email" type="email" required autocomplete="email" placeholder="you@example.com">
        </div>
        <div class="field">
          <label for="subject" class="mono">Subject</label>
          <input id="subject" name="subject" type="text" placeholder="${esc(f.fields.subject)}">
        </div>
        <div class="field">
          <label for="message" class="mono">Message</label>
          <textarea id="message" name="message" rows="5" required placeholder="${esc(f.fields.message)}"></textarea>
        </div>

        <button type="submit" class="btn btn--block"><span class="form__label">Send message</span>${ICON_ARROW}</button>

        <p id="form-ok" class="form__msg form__msg--ok mono" role="status" hidden>${esc(f.ok)}</p>
        <p id="form-err" class="form__msg form__msg--err mono" role="alert" hidden>${esc(f.err)}</p>
      </form>
    </div>
  </section>`;
}

// ── pages ────────────────────────────────────────────────────────────────────

/**
 * Section order is the argument the page makes.
 *
 * The work comes before anything else that isn't the hero, because a visitor
 * deciding whether to hire a photographer is deciding on the photographs. The
 * brand mark used to sit at position two and delayed them; it now falls after
 * the grid as a scene break, where it reads as punctuation rather than a
 * toll gate. Services and process answer "can you do my thing" and "what
 * happens if I email you" — the two questions a portfolio usually leaves
 * hanging — and both sit between the work and the ask.
 */
function homePage(images) {
  const main = [
    hero(images),
    ticker(),
    `  <section id="work" class="work" aria-label="Selected work"${rigCue('work')}>
    <header class="sec-head">
      ${eyebrow(COPY.work.eyebrow, '02')}
      ${secTitle(COPY.work.title)}
      <p class="sec-note mono reveal">${esc(COPY.work.note)}</p>
    </header>

    <div class="work__seq">
${indent(sequence(HOME_SEQUENCE, images), 6)}
    </div>

    <div class="work__more">
      <a class="btn" href="/work/"><span>See all work</span>${ICON_ARROW}</a>
    </div>
  </section>`,
    brand(),
    signal(images),
    services(),
    processBlock(),
    aboutBlock(images),
    contactBlock(),
  ].join('\n\n');

  const e = images[HERO];
  return page({
    title: `${SITE.name} — Live Music & Concert Photography, Bay Area`,
    description: `${SITE.name} is a Bay Area photographer shooting live music, street, fashion, portraiture and community. Available for shows, editorial and portrait work.`,
    canonical: '/',
    ogImage: '/assets/images/hero-001.webp',
    jsonLd: personSchema(),
    preloadHero: {
      href: abs(e.variants[Math.min(1, e.variants.length - 1)].avif),
      srcset: e.variants.map((v) => `${abs(v.avif)} ${v.w}w`).join(', '),
      sizes: SIZES.hero,
    },
    gel: RIG.home.hue,
    intro: true,
    hasLightbox: true,
    main,
  });
}

/**
 * The gel filter — a radio group, and CSS-only at its core.
 *
 * `:has()` on the section plus `[data-light~="…"]` does the whole filter with
 * one rule per gel and no script. That is not a graceful degradation, it is the
 * actual mechanism: with JavaScript disabled the filter still works. JS only
 * adds the animated re-layout and the URL state on top.
 *
 * A radio group is also the correct semantics for single-select — better than
 * a row of buttons with aria-pressed, which is what this wanted to be first.
 * The inputs are clipped rather than display:none so they stay focusable.
 *
 * Counts are tallied from the sequence itself, so they can never disagree with
 * what is actually on the page.
 */
function filterBar(order) {
  const tally = (key) => order.filter((n) => META[n].light.includes(key)).length;
  const chip = (key, label, n, on) =>
    `        <input type="radio" name="light" id="f-${key}" class="filter__in" value="${key}"${on ? ' checked' : ''}>
        <label class="filter__chip" for="f-${key}"><span class="filter__label">${esc(label)}</span><span class="filter__n mono">${String(n).padStart(2, '0')}</span></label>`;

  const chips = [
    chip('all', 'All', order.length, true),
    ...GELS.filter((g) => tally(g.key) > 0).map((g) => chip(g.key, g.label, tally(g.key), false)),
  ].join('\n');

  return `    <fieldset class="filter">
      <legend class="filter__legend mono">Filter by light</legend>
      <div class="filter__chips">
${chips}
      </div>
    </fieldset>
    <p class="filter__status sr-only" role="status"></p>`;
}

function workIndexPage(images) {
  const order = SEQUENCE.flatMap((r) => r.frames);
  const main = `  <section class="work work--index" aria-label="All work"${rigCue('work')}>
    <header class="sec-head sec-head--page">
      ${eyebrow(COPY.work.eyebrow, '02')}
      ${secTitle(COPY.work.indexTitle)}
      <p class="sec-note mono reveal">${esc(COPY.work.indexNote)}</p>
    </header>

${filterBar(order)}

    <div class="work__seq" id="archive">
${indent(sequence(SEQUENCE, images), 6)}
    </div>
  </section>

${contactCta()}`;

  return page({
    title: `Work — ${SITE.name}`,
    description: `The full archive of ${SITE.name}'s live music and editorial photography from Bay Area venues.`,
    canonical: '/work/',
    ogImage: '/assets/images/portfolio_003.webp',
    jsonLd: personSchema(),
    gel: RIG.work.hue,
    hasLightbox: true,
    main,
  });
}

const contactCta = () => `  <section class="cta" aria-label="Work with Mario">
    <div class="cta__inner reveal">
      <h2 class="cta__title">Have a show<br><em>coming up?</em></h2>
      <a class="btn" href="/contact/"><span>Get in touch</span>${ICON_ARROW}</a>
    </div>
  </section>`;

function framePage(name, images, order) {
  const entry = images[name];
  const meta = META[name];
  const slug = slugify(meta.title);
  const i = order.indexOf(name);
  const prev = order[(i - 1 + order.length) % order.length];
  const next = order[(i + 1) % order.length];
  const largest = entry.variants[entry.variants.length - 1];

  const nav = (target, dir) => {
    const m = META[target];
    return `<a class="framenav__link framenav__link--${dir}" href="/work/${slugify(m.title)}/">
      <span class="mono">${dir === 'prev' ? 'Previous' : 'Next'}</span>
      <span class="framenav__title">${esc(m.title)}</span>
    </a>`;
  };

  const main = `  <article class="solo" aria-labelledby="solo-title" data-name="${name}">
    <header class="solo__head">
      ${eyebrow(`Frame ${String(i + 1).padStart(2, '0')} / ${String(order.length).padStart(2, '0')}`)}
      <h1 class="solo__title" id="solo-title">${esc(meta.title)}</h1>
    </header>

    <div class="solo__stage reveal">
${indent(media(entry, meta, { sizes: SIZES.solo, eager: true, className: 'solo__img' }, 'frame__media--solo'), 6)}
    </div>

    <div class="solo__body">
      <p class="solo__caption">${esc(meta.alt)}</p>

      <dl class="solo__meta mono">
        <div><dt>Subject</dt><dd>${esc(meta.discipline)}</dd></div>
        <div><dt>Light</dt><dd>${esc(meta.light.map((k) => gel(k).label).join(' · '))}</dd></div>
        <div><dt>Location</dt><dd>Bay Area, CA</dd></div>
        <div><dt>Orientation</dt><dd>${entry.orientation}</dd></div>
        <div><dt>Photographer</dt><dd>${esc(SITE.name)}</dd></div>
      </dl>
    </div>

    <nav class="framenav" aria-label="Frame navigation">
      ${nav(prev, 'prev')}
      <a class="framenav__all" href="/work/">${ICON_ARROW_L}<span class="mono">All work</span></a>
      ${nav(next, 'next')}
    </nav>
  </article>

${contactCta()}`;

  return page({
    title: `${meta.title} — ${SITE.name}`,
    description: meta.alt,
    canonical: `/work/${slug}/`,
    ogImage: abs(largest.webp),
    ogType: 'article',
    bodyClass: 'is-solo',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      name: meta.title,
      description: meta.alt,
      contentUrl: SITE.origin + abs(largest.webp),
      thumbnailUrl: SITE.origin + abs(entry.variants[0].webp),
      width: entry.width,
      height: entry.height,
      creator: { '@type': 'Person', name: SITE.name, url: SITE.origin + '/' },
      copyrightHolder: { '@type': 'Person', name: SITE.name },
      contentLocation: { '@type': 'Place', name: 'Bay Area, California' },
      genre: 'Live music photography',
    },
    preloadHero: {
      href: abs(entry.variants[Math.min(1, entry.variants.length - 1)].avif),
      srcset: entry.variants.map((v) => `${abs(v.avif)} ${v.w}w`).join(', '),
      sizes: SIZES.solo,
    },
    // The room is already lit for this photograph before any script runs.
    gel: gel(meta.light[0]).hue,
    hasLightbox: true,
    main,
  });
}

function aboutPage(images) {
  return page({
    title: `About — ${SITE.name}`,
    description: `${SITE.name} is a Bay Area based photographer working in live music, street, fashion, portraiture, art culture and community.`,
    canonical: '/about/',
    ogImage: '/assets/images/portfolio_009.webp',
    jsonLd: personSchema(),
    main: `${aboutBlock(images, { full: true })}\n\n${services()}\n\n${contactCta()}`,
    gel: RIG.about.hue,
    hasLightbox: true,
  });
}

function contactPage() {
  return page({
    title: `Contact — ${SITE.name}`,
    description: `Get in touch with ${SITE.name} for live music, editorial, portrait and event photography in the Bay Area.`,
    canonical: '/contact/',
    jsonLd: personSchema(),
    // The process strip sits under the form on purpose: the question someone
    // has with their hand on a contact form is "what happens after I send this".
    main: `${contactBlock()}\n\n${processBlock()}`,
    gel: RIG.contact.hue,
  });
}

// ── run ──────────────────────────────────────────────────────────────────────

async function emit(rel, html) {
  const file = path.join(ROOT, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  return rel;
}

async function main() {
  const { images } = JSON.parse(await readFile(MANIFEST, 'utf8'));

  const missing = Object.keys(META).filter((k) => !images[k]);
  if (missing.length) {
    console.error(`✗ manifest is missing: ${missing.join(', ')} — run \`npm run images\``);
    process.exit(1);
  }

  const order = SEQUENCE.flatMap((r) => r.frames);
  const written = [];

  written.push(await emit('index.html', homePage(images)));
  written.push(await emit('work/index.html', workIndexPage(images)));
  for (const name of order) {
    written.push(await emit(`work/${slugify(META[name].title)}/index.html`, framePage(name, images, order)));
  }
  written.push(await emit('about/index.html', aboutPage(images)));
  written.push(await emit('contact/index.html', contactPage()));

  // Built from the same list that was just written, so it can't list a page
  // that doesn't exist or miss one that does.
  const urls = written
    .map((w) => `  <url><loc>${SITE.origin}/${w.replace(/index\.html$/, '')}</loc></url>`)
    .join('\n');
  await emit(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
  await emit('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.origin}/sitemap.xml\n`);

  console.log(`\n  Site built — ${written.length} pages + sitemap.xml, robots.txt\n`);
  for (const w of written) console.log(`    /${w.replace(/index\.html$/, '')}`);
  console.log(`\n  ${order.length} frames · one page each · shared chrome from tools/lib/shell.mjs\n`);
}

main().catch((err) => {
  console.error('\n✗ build-site failed:', err.message);
  process.exit(1);
});
