/**
 * content.mjs — every word on the site, and the layout state, in one place.
 *
 * Copy lives here rather than scattered through templates so it can be changed
 * without touching markup, and so the same strings feed the page bodies, the
 * <title> tags and the social cards without drifting apart.
 */

export const SITE = {
  name: 'Mario Preciado',
  role: 'Photographer',
  origin: 'https://mario-preciado-rebuild.vercel.app',
  email: 'marioopreciadoo@gmail.com',
  instagram: 'https://www.instagram.com/mariopreciado.art',
  instagramHandle: '@mariopreciado.art',
  location: 'San Francisco Bay Area',
  coords: '37.8044° N / 122.2712° W',
  tagline: 'Capturing live moments & visuals',
  disciplines: ['Live Music', 'Street', 'Fashion', 'Portraiture', 'Art Culture', 'Community'],
  formspree: 'https://formspree.io/f/xanyvgkj',
};

/**
 * The gels, in the order they appear on the filter bar.
 *
 * These are not invented genre tags. Mario's own bio names colour as the
 * subject — "expressing the style and vibrant colors that I believe help
 * reflect the atmosphere" — and the 13 frames really do sort into five
 * lighting states. Filtering by the light is the taxonomy the work already
 * has; filtering by genre would mean making one up, because all of it is
 * shot in a venue.
 *
 * `hue` is the rotation applied to the projection layer when a frame or
 * section on this gel is in view. `key` is what lands in `data-light`.
 */
export const GELS = [
  { key: 'liquid', label: 'Liquid Light', hue: -32 },
  { key: 'red',    label: 'Red Wash',     hue: 128 },
  { key: 'amber',  label: 'Amber Hour',   hue: 46 },
  { key: 'green',  label: 'Green Room',   hue: 78 },
  { key: 'crowd',  label: 'The Crowd',    hue: -95 },
];

export const gel = (key) => GELS.find((g) => g.key === key);

/**
 * Alt text describes each frame for someone who can't see it. Titles are the
 * frame's name, not a caption — they read as plate titles in a portfolio.
 *
 * `light` is a list of gel keys, not one. Stage lighting is mixed — Solar is
 * genuinely a red room lit by an amber orb, and Lead Vocalist is a green wash
 * with a violet rim. Forcing one tag per frame would be both less true and
 * would leave categories holding a single photograph, which makes a filter
 * feel broken. The first key is the dominant one.
 *
 * `discipline` is drawn from SITE.disciplines and describes what the frame
 * actually is — most of this body of work is live music, and it says so rather
 * than padding the range.
 */
export const META = {
  'hero-001':      { title: 'Blue Room',     light: ['liquid'],         discipline: 'Live Music',  alt: 'Musician in a bucket hat and glasses playing a synth rig beneath a blue and magenta liquid light projection.' },
  'hero-002':      { title: 'Amber Hour',    light: ['amber'],          discipline: 'Live Music',  alt: 'Singer at the microphone behind a blue keyboard, lit in warm amber and olive stage light.' },
  'portfolio_001': { title: 'Liquid Light',  light: ['liquid'],         discipline: 'Live Music',  alt: 'Band on stage under a psychedelic green and magenta liquid light projection, guitarist at the microphone.' },
  'portfolio_002': { title: 'Tinsel',        light: ['amber'],          discipline: 'Live Music',  alt: 'Vocalist in a patterned dress arching backward mid-note in front of a silver tinsel curtain, drummer behind.' },
  'portfolio_003': { title: 'Crowd Motion',  light: ['crowd'],          discipline: 'Community',   alt: 'Crowd surfer carried on raised hands through a packed audience under blue stage light.' },
  'portfolio_004': { title: 'Red Kit',       light: ['red'],            discipline: 'Live Music',  alt: 'Drummer mid-set drenched in deep red stage light, cymbals catching the glow.' },
  'portfolio_005': { title: 'Lead Vocalist', light: ['green', 'liquid'], discipline: 'Live Music',  alt: 'Guitarist leaning into the microphone in profile, violet rim light across a white electric guitar.' },
  'portfolio_006': { title: 'Reach',         light: ['red'],            discipline: 'Live Music',  alt: 'Vocalist in a floral dress holding the microphone stand overhead against a tinsel backdrop.' },
  'portfolio_007': { title: 'Solar',         light: ['amber', 'red'],   discipline: 'Live Music',  alt: 'Lone performer silhouetted against a giant glowing orange orb backdrop in a red-washed room.' },
  'portfolio_008': { title: 'Main Stage',    light: ['crowd'],          discipline: 'Live Music',  alt: 'Wide venue shot — an arched stage set in blue light and smoke, audience silhouetted in the foreground.' },
  'portfolio_009': { title: 'Raw Energy',    light: ['amber'],          discipline: 'Live Music',  alt: 'Guitarist in a black cowboy hat and fringed jacket playing against a fiery orange backdrop.' },
  'portfolio_010': { title: 'Wide Brim',     light: ['amber'],          discipline: 'Portraiture', alt: 'Long-haired guitarist in a wide-brimmed hat singing at the microphone under warm amber light.' },
  'portfolio_011': { title: 'Green Room',    light: ['green'],          discipline: 'Live Music',  alt: 'Guitarist with a hollow-body electric bathed in deep green stage light.' },
};

/**
 * The editorial rhythm of the work sequence. Alternating scale is what stops a
 * photo gallery reading as a contact sheet — full-bleed singles to breathe,
 * unequal pairs for tension, one triptych as a change of pace.
 */
export const SEQUENCE = [
  { row: 'full',    frames: ['portfolio_003'] },
  { row: 'duo',     frames: ['portfolio_001', 'portfolio_007'] },
  { row: 'full',    frames: ['portfolio_008'] },
  { row: 'trio',    frames: ['portfolio_009', 'portfolio_011', 'portfolio_005'] },
  { row: 'duo-rev', frames: ['portfolio_002', 'portfolio_006'] },
  { row: 'duo',     frames: ['portfolio_010', 'portfolio_004'] },
];

/** Home shows a curated subset; /work shows everything. */
export const HOME_SEQUENCE = [
  { row: 'full',    frames: ['portfolio_003'] },
  { row: 'duo',     frames: ['portfolio_001', 'portfolio_007'] },
  { row: 'trio',    frames: ['portfolio_009', 'portfolio_011', 'portfolio_005'] },
];

export const HERO = 'hero-001';
export const SIGNAL = 'hero-002';
export const ABOUT_STRIP = ['portfolio_007', 'portfolio_009', 'portfolio_010'];

export const NAV = [
  { idx: '01', label: 'Home', href: '/' },
  { idx: '02', label: 'Work', href: '/work/' },
  { idx: '03', label: 'About', href: '/about/' },
  { idx: '04', label: 'Contact', href: '/contact/' },
];

export const COPY = {
  hero: {
    eyebrow: 'Bay Area · CA',
    title: ['Capturing', 'live moments', '& visuals'],
    lede: 'Live music, portraiture and editorial work across the Bay Area. Available for shows, features and commissions.',
  },
  work: {
    eyebrow: 'Selected Work',
    title: ['Recent', 'Captures'],
    note: 'Selected frames from recent shows. Select any image to view it larger.',
    indexTitle: ['The full', 'archive'],
    indexNote: 'Every frame currently on show, newest sequences first.',
  },
  signal: {
    eyebrow: 'Featured',
    title: ['On', 'stage'],
  },
  about: {
    eyebrow: 'About the artist',
    title: ['Behind the', 'lens'],
    bio: [
      { html: `I'm <strong>Mario Preciado</strong>, a Bay Area based photographer.`, prompt: true },
      { html: `My photography consists of live music, street, fashion, portraiture, art culture and community. My focus is expressing the style and vibrant colors that I believe help reflect the atmosphere of these subjects and events.` },
      { html: `I look forward to working with you.`, em: true },
    ],
    stats: [
      { n: 'Live', k: 'Music & events' },
      { n: 'Editorial', k: 'Portrait & feature' },
      { n: 'Bay Area', k: 'Available to travel' },
    ],
  },
  /**
   * Six services, one per discipline Mario actually lists. Nothing here
   * promises a turnaround, a deliverable format or a price, because none of
   * those are known — "by inquiry" is the honest answer and it is also what
   * most working photographers publish.
   */
  services: {
    eyebrow: 'Services',
    title: ['What I', 'shoot'],
    note: 'Rates and availability by inquiry — send the date and the room.',
    items: [
      { name: 'Live Music',   tag: 'Venues · festivals · tours',   line: 'Full sets shot from the pit and the floor. Low light is the point, not the problem.' },
      { name: 'Portraiture',  tag: 'Artists · bands · press',      line: 'Character-driven portraits, on location or in the room you already play in.' },
      { name: 'Editorial',    tag: 'Features · profiles',          line: 'Story-led shoots for features and profiles, built around the piece being written.' },
      { name: 'Fashion',      tag: 'Lookbooks · styled shoots',    line: 'Styled work with the same colour-forward eye that runs through the live sets.' },
      { name: 'Art Culture',  tag: 'Openings · installations',     line: 'Coverage of shows, openings and the scenes that grow around them.' },
      { name: 'Community',    tag: 'Events · gatherings',          line: 'The crowd, the room and everything happening off the stage.' },
    ],
  },

  /**
   * Four steps, deliberately free of numbers. It answers "what happens if I
   * email him" without inventing a service-level agreement.
   */
  process: {
    eyebrow: 'Process',
    title: ['How it', 'works'],
    steps: [
      { name: 'Enquiry',  line: 'Send the date, the venue and what you need. I come back with availability and a quote.' },
      { name: 'Brief',    line: 'We lock the scope — set times, access, how many frames, and where the images will run.' },
      { name: 'The shoot', line: 'I work light and stay out of the way. Bay Area as standard, available to travel.' },
      { name: 'Delivery', line: 'A selected, edited gallery. Additional frames and rush turnaround on request.' },
    ],
  },

  contact: {
    eyebrow: 'Contact',
    title: ["Let's work", 'together'],
    pitch: 'Available for live music, editorial, portrait and event work. Tell me about your project and I’ll get back to you.',
    ok: 'Thanks — your message is through. I’ll be in touch shortly.',
    err: `Something went wrong sending that. Please email me directly at ${SITE.email}.`,
    fields: {
      subject: 'Live show, portrait session, editorial…',
      message: 'Dates, venue, what you have in mind…',
    },
  },
};

/**
 * The lighting cue sheet — one channel per section.
 *
 * Scrolling into a section is a cue: the projection layer rotates to `hue`, and
 * the HUD readout ticks over to this channel. Sections are numbered in the
 * order they appear on the home page so the readout counts up as you scroll,
 * which is the whole reason it reads as a rig and not as decoration.
 *
 * `k` is a plausible colour temperature for the gel named. It is set dressing
 * on a readout, not a claim about how any photograph was lit.
 */
export const RIG = {
  home:     { ch: '01', gel: 'Liquid',  k: '3200K', hue: -32 },
  work:     { ch: '02', gel: 'Magenta', k: '5600K', hue: 0 },
  signal:   { ch: '03', gel: 'Amber',   k: '2900K', hue: 46 },
  services: { ch: '04', gel: 'Violet',  k: '6500K', hue: -60 },
  process:  { ch: '05', gel: 'Cyan',    k: '7200K', hue: -95 },
  about:    { ch: '06', gel: 'Green',   k: '4400K', hue: 78 },
  contact:  { ch: '07', gel: 'Red',     k: '2200K', hue: 128 },
};

/** "Crowd Motion" -> "crowd-motion". Stable, so permalinks don't churn. */
export const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
