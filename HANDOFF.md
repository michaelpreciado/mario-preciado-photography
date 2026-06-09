# Claude Code Handoff — Mario Preciado Photography Rebuild

> **To:** Claude Code (claude-code CLI)
> **From:** Hermes (Preciado Tech Web Pipeline v1.0)
> **Date:** 2026-06-09
> **Status:** Scaffold deployed, ready for enhancement pass

---

## Mission

Take the existing scaffold at `/home/mp/preciado-tech-workspace/mario-preciado-rebuild/`
and produce a **production-grade photography portfolio site** for Mario Preciado,
a Bay Area live music / street / fashion / portraiture photographer.

The scaffold is **functional and deployed** at
`https://mario-preciado-rebuild.vercel.app/` — your job is to elevate it to
"client-ready" quality while preserving the existing brand voice and aesthetic.

---

## Context Files (Read These First)

1. `inspiration.md` — X API-sourced research, reference sites, anti-patterns
2. `index.html` — Current entry point (DO NOT replace; enhance)
3. `css/style.css` — Current styles (extend, don't rewrite)
4. `js/main.js` — Current portfolio grid logic (refactor for performance)
5. `assets/images/` — 11 scraped concert photos + 2 hero images
6. `README.md` — Project context (create this if missing)

---

## Brand Spec (Locked)

- **Name:** Mario Preciado
- **Tagline:** "Capturing the *wild hours*"
- **Location:** Bay Area, CA
- **Disciplines:** Live Music, Street, Fashion, Portraiture, Community
- **Tone:** Wild, vibrant, high-energy. Personal, human, not corporate.
- **Color palette:** Black `#000000` + Neon Pink `#ff10f0` accent (glow on text only)
- **Typography:** Inter (loaded via Google Fonts). Bold headlines, mono labels.
- **Existing social:** Instagram `@mariopreciado.art` (NOT `mariopreciado.photography`)

---

## Current State (What's Built)

✅ HTML scaffold with 4 sections: Hero, About, Recent Captures, Contact
✅ 11 portfolio images loaded from `assets/images/portfolio_001-011.webp`
✅ 2 hero images: `hero-001.webp`, `hero-002.webp`
✅ Vercel deployment pipeline configured
✅ Git initialized (master branch)
✅ Mobile responsive, masonry grid, hover overlays, neon glow effects

✅ Lightbox for full-size image viewing
❌ Featured Capture hero rotator
❌ Zine/Editorial section (recommended by X research)
❌ Loading states / skeleton screens
❌ SEO meta tags
❌ Open Graph tags for social sharing
❌ Image lazy loading verification
❌ Accessibility audit (ARIA labels, keyboard nav)

---

## Suggested Next Moves (Pick Up Where I Left Off)

### Priority 1: Lightbox Implementation
- Click any grid image → fullscreen overlay
- Keyboard nav (arrow keys, esc to close)
- Touch swipe on mobile
- Show image metadata (title, category, alt text)

### Priority 2: Featured Capture Hero
- Add a "Featured Capture" module between About and Recent Captures
- Single large image with overlay text (editorial poster pattern)
- Either static (one chosen shot) or random-rotating

### Priority 3: SEO + OG Tags
- `<title>` per section
- Open Graph image (use `hero-001.webp`)
- Twitter card meta
- JSON-LD structured data for `Person` schema (Mario as photographer)

### Priority 4: Accessibility Pass
- ARIA labels on all interactive elements
- Skip-to-content link
- Focus indicators (currently invisible on black bg)
- Reduce motion media query (`prefers-reduced-motion`)

### Priority 5: Performance
- Verify lazy loading works (currently set but untested)
- Add `<link rel="preconnect">` for Google Fonts
- Compress any remaining large images
- Lighthouse audit (target 95+ on all categories)

---

## Asset Manifest

```
assets/images/
├── hero-001.webp         # Main hero photo (female vocalist, red dress, gold backdrop)
├── hero-002.webp         # Secondary hero (backup)
├── portfolio_001.webp    # Live Music 001 (portrait, 776x1012)
├── portfolio_002.webp    # Live Music 002 (landscape, 1024x768)
├── portfolio_003.webp    # Live Music 003 (landscape)
├── portfolio_004.webp    # Live Music 004 (portrait, 1280x1706)
├── portfolio_005.webp    # Live Music 005 (portrait, 1280x960)
├── portfolio_006.webp    # Live Music 006 (portrait)
├── portfolio_007.webp    # Live Music 007 (portrait, 1280x1707)
├── portfolio_008.webp    # Live Music 008 (landscape)
├── portfolio_009.webp    # Live Music 009 (portrait, 1280x1693)
├── portfolio_010.webp    # Live Music 010 (square, 848x636)
└── portfolio_011.webp    # Live Music 011 (portrait, 1280x960)
```

All images sourced from `https://photography-portfolio-chi-nine.vercel.app/`
on 2026-06-09. Original site was at `mariopreciado.photography` per
domain mapping notes.

---

## Instagram Scraping (Next Phase, Not This Pass)

Mario's Instagram: `https://www.instagram.com/mariopreciado.art`
Plan: scrape latest 30 posts, add to `assets/images/scraped/`, update
`portfolioImages` array in `js/main.js`. Instagram scraping is blocked
in this environment (bot detection) — will need a different approach
(probably via Apify or a manual export request to the client).

**Defer this until after Claude Code's enhancement pass.**

---

## Google Places Pipeline (Future, Not This Pass)

Once this template is locked, the plan is to:
1. Scrape Google Places API for local photographers / venues / creatives
2. Run each through this same pipeline (scrape → identity.json → rebuild)
3. Deploy each as a standalone repo or as a previews page on `preciado-tech.com`

**Track this in the `web-dev-pipeline` skill (to be created post-handoff).**

---

## Domain Mapping (CRITICAL — Do Not Get This Wrong)

- `michael-preciado.com` → personal profile
- `preciado-tech.com` → business / agency services
- `mariopreciado.photography` → Mario's current site (legacy, do not link to it)
- `mariopreciado.art` → Mario's Instagram (correct handle, use this)

**Mario's eventual custom domain for this rebuild is TBD.** For now, the
Vercel preview URL is the canonical address.

---

## Deploy Workflow

```bash
cd /home/mp/preciado-tech-workspace/mario-preciado-rebuild
# Make changes
git add -A
git commit -m "description"
vercel --yes --prod  # deploys to mario-preciado-rebuild.vercel.app
```

Vercel CLI is at `/home/mp/.local/share/mise/installs/node/25.2.1/bin/vercel`
and is authenticated against the `preciado-tech` team.

---

## Constraints & Red Lines

- ❌ Do NOT remove the existing scaffold — enhance it
- ❌ Do NOT change the color palette (black + neon pink is locked)
- ❌ Do NOT add a light mode (dark-only is the brand commitment)
- ❌ Do NOT add carousels on the landing page (kills mobile performance)
- ❌ Do NOT generate fake services or prices — Mario's real services only
- ❌ Do NOT link to `mariopreciado.photography` (legacy domain)
- ❌ Do NOT use watermarks on images
- ❌ Do NOT add cookie banners

- ✅ Do match the existing typography hierarchy
- ✅ Do preserve the "wild hours" italic accent
- ✅ Do add `<meta>` tags for SEO
- ✅ Do test on mobile (Chrome DevTools mobile view)
- ✅ Do commit frequently with descriptive messages
- ✅ Do update `README.md` as features are added

---

## Open Questions (Ask Michael Before Guessing)

1. Does Mario want a blog/zine section? (X signal says yes)
2. Does he want a pricing/booking page, or just contact form?
3. Custom domain planned? (need to know for Vercel config)
4. "Featured Capture" rotator — yes/no?

---

## Pipeline Context (Why This Exists)

This project is the **first end-to-end test** of the Preciado Tech
Web Dev Pipeline. Once this template is locked, the goal is to
replicate it for any client — scrape identity → inject into this
template → deploy. The factory must be repeatable.

If you make changes that would be useful as defaults for the
*next* client, extract them into a `web-dev-pipeline` skill
(create it at `~/.hermes/profiles/jarvis/skills/web-dev-pipeline/SKILL.md`).

---

*Handed off by Hermes — Preciado Tech Web Pipeline v1.0*
*Scaffold: https://mario-preciado-rebuild.vercel.app/*
*Repo: /home/mp/preciado-tech-workspace/mario-preciado-rebuild/*
