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
 * Alt text describes each frame for someone who can't see it. Titles are the
 * frame's name, not a caption — they read as plate titles in a portfolio.
 */
export const META = {
  'hero-001':      { title: 'Blue Room',     alt: 'Musician in a bucket hat and glasses playing a synth rig beneath a blue and magenta liquid light projection.' },
  'hero-002':      { title: 'Amber Hour',    alt: 'Singer at the microphone behind a blue keyboard, lit in warm amber and olive stage light.' },
  'portfolio_001': { title: 'Liquid Light',  alt: 'Band on stage under a psychedelic green and magenta liquid light projection, guitarist at the microphone.' },
  'portfolio_002': { title: 'Tinsel',        alt: 'Vocalist in a patterned dress arching backward mid-note in front of a silver tinsel curtain, drummer behind.' },
  'portfolio_003': { title: 'Crowd Motion',  alt: 'Crowd surfer carried on raised hands through a packed audience under blue stage light.' },
  'portfolio_004': { title: 'Red Kit',       alt: 'Drummer mid-set drenched in deep red stage light, cymbals catching the glow.' },
  'portfolio_005': { title: 'Lead Vocalist', alt: 'Guitarist leaning into the microphone in profile, violet rim light across a white electric guitar.' },
  'portfolio_006': { title: 'Reach',         alt: 'Vocalist in a floral dress holding the microphone stand overhead against a tinsel backdrop.' },
  'portfolio_007': { title: 'Solar',         alt: 'Lone performer silhouetted against a giant glowing orange orb backdrop in a red-washed room.' },
  'portfolio_008': { title: 'Main Stage',    alt: 'Wide venue shot — an arched stage set in blue light and smoke, audience silhouetted in the foreground.' },
  'portfolio_009': { title: 'Raw Energy',    alt: 'Guitarist in a black cowboy hat and fringed jacket playing against a fiery orange backdrop.' },
  'portfolio_010': { title: 'Wide Brim',     alt: 'Long-haired guitarist in a wide-brimmed hat singing at the microphone under warm amber light.' },
  'portfolio_011': { title: 'Green Room',    alt: 'Guitarist with a hollow-body electric bathed in deep green stage light.' },
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

/** "Crowd Motion" -> "crowd-motion". Stable, so permalinks don't churn. */
export const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
