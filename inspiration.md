# Design Inspiration — Live Music / Concert Photography Portfolios

> Research brief compiled for Claude Code handoff. Mario Preciado's brand is
> "Capturing live moments & visuals" — live music, street, fashion, portraiture.
> Target aesthetic: dark, immersive, photo-first, with neon-pink accents that
> echo stage lighting.

---

## Section A: X (Twitter) Live Signal — Sourced 2026-06-09

Pulled via X API v2 recent search (last 7 days). Three productive queries:
1. `concert photographer lang:en` → 20 tweets
2. `#photographer #website OR #photo #design lang:en` → 25 tweets
3. `neon aesthetic website OR dark portfolio design OR photo grid layout lang:en` → 25 tweets

### Trending Patterns in the Concert Photography Niche

**Community norms (what photographers are doing right now):**
- **"Concert recap" thread format** dominates — photographers post a set
  of shots from a single show with a write-up and credit the original shooter.
  Pattern: `📸/✍️: @handle` + `{CREDIT PHOTOGRAPHER WHEN SHARING}`. We can
  adopt this on the "About" page to position Mario as a community player.
- **Photobook / editorial format is peaking.** A recent "Riser Concert
  Photobook" tweet hit 47 RTs — the highest-engagement item in our sample.
  → Implication: a separate "Zine / Editorial" section (or future merch page)
  would resonate with the community.

**Design language signals:**
- **"Psychedelic" + dark background** is the dominant concert photography
  aesthetic. Stage lights on dark venue backgrounds are the signature look.
  Our neon-pink accent is in-lane.
- **Vertical/9:16 mobile content** is the default. Every photographer
  posts in vertical crops for IG/TikTok. The site grid should look
  good in both orientations.
- **AI design prompts** are flooding the feed (GPT Image 2, Nano Banana 2)
  — many of them are vertical "editorial poster" style with one bold
  subject and minimal text. This is a useful layout pattern for a hero
  "Featured Capture" module.

**Photographer handles/identities worth reverse-engineering:**
- `@dy4ni_` — credited photographer on a Tash Sultana recap
  (aesthetic: psychedelic, high-saturation, dark venue)
- `@martiverse__` — concert photographer sharing "masterpiece" sets
  (aesthetic: stage-lit portrait, fan-archive vibe)
- `@nini_whheart` — posted the viral Riser Photobook (47 RTs)
  (aesthetic: editorial, physical book design, dark)
- Anonymous community photographers sharing through-line: tight crops,
  band member focus, fan point-of-view (POV) shots that feel like
  *you're in the crowd*.

**Anti-patterns seen in the X feed:**
- ❌ Canva / template-generated graphics (low engagement, "stock" feel)
- ❌ Promotional-only tweets ("DM for booking") with no visual work
- ❌ Over-saturated edits that destroy stage lighting nuance
- ❌ Watermarks plastered across the image (kills shareability)

### Mario's Differentiation Angle

Compared to the X activity, Mario's brand "Capturing live moments & visuals"
is **stronger written voice** than most competitors. The neon-pink + black
combo is distinctive.

1. Lead with the brand line as hero text (already done in scaffold)
2. Make the "About" copy more personal — X photographers who win are the
   ones who sound like humans, not services
3. Reserve a "Featured Capture" slot that rotates to showcase a single
   image per visit — mimics the editorial poster pattern

---

## Section B: Curated Reference Sites (Pattern Catalog)

### 1. Pooneh Ghana — `pooneh.net`
- **Layout:** Single column, full-bleed image, minimal chrome
- **Takeaway for us:** Show the photo first, fade UI on scroll
- **Steal:** Edge-to-edge images, no rounded corners, almost no nav

### 2. Alive Coverage — `alivecoverage.com`
- **Layout:** Hero text overlaid on a full-bleed photo
- **Accent color:** Bright magenta/pink on black — *almost identical to our spec*
- **Takeaway for us:** Our "Capturing live moments & visuals" over a concert shot
  is right in this lane. We can pull their color contrast and bold font weight
- **Steal:** Big italic accent words, button with thin border

### 3. Aidan Cullen
- **Layout:** Editorial masonry, mixed aspect ratios
- **Takeaway for us:** This is what we already scaffolded — confirms the grid
  choice was correct
- **Steal:** Hover-reveal overlays, category micro-tags

### 4. Mark Seliger — `markseliger.com`
- **Layout:** Massive hero, then single-column "featured" row
- **Typography:** Classic serif headlines
- **Takeaway for us:** Consider adding a "Featured Capture" hero card
  between the about and grid sections

### 5. Sam Taylor-Johnson
- **Layout:** Fullscreen, no nav on landing
- **Takeaway for us:** Maybe add a "Press 'esc' to enter" intro frame?
  Optional — risk of being gimmicky

### 6. Concert photographer collectives (Nasty Little Man, Dangerbird)
- **Layout:** Grid of equal-sized thumbnails, hover-zoom
- **Takeaway for us:** Good fallback for the "all-captures" view

---

## Section C: Locked Design Decisions (Do Not Deviate)

| Element | Spec |
|---|---|
| Background | `#000000` solid black, no gradients |
| Accent color | `#ff10f0` neon pink (glow on text only) |
| Body text | `#e4e4e7` zinc-200, Inter font |
| Secondary text | `#71717a` zinc-500 |
| Hero font size | 7xl desktop, 5xl mobile |
| Grid | CSS columns masonry, 3-col desktop, 2-col tablet, 1-col mobile |
| Image hover | Scale 1.05, dim overlay with category + title |
| Section spacing | py-24 (96px) between major sections |
| Buttons | Border-only, 1px white/pink, no fill, hover invert |

---

## Section D: Anti-Patterns to Avoid

- ❌ Carousels on landing — kills mobile performance
- ❌ White backgrounds — ruins photo vibrancy
- ❌ Drop shadows on images — looks dated, distracts from subject
- ❌ Stock icons for social — circle monochrome is fine, but make them thin
- ❌ "Back to top" buttons — unnecessary with smooth scroll
- ❌ Cookie banners on portfolio sites — feels corporate
- ❌ Canva-template look (low-engagement signal on X)
- ❌ Promotional-only content with no visual proof
- ❌ Over-saturated edits that destroy stage lighting nuance
- ❌ Watermarks plastered across images

---

## Section E: Mobile-First Priorities

1. Hero stacks vertically: photo on top, text below
2. Portfolio grid: 1 column below 640px
3. Nav collapses to hamburger at md breakpoint
4. Tap targets minimum 44x44px
5. Image loading: `loading="lazy"` + `decoding="async"` everywhere

---

## Section F: Open Questions for Stakeholder Review

- [ ] Does Mario want a blog/zine section? (X signal: photobooks are hot)
- [ ] Does he want a pricing/booking page, or just contact form?
- [ ] Should we add a Lightbox for full-size image viewing?
- [ ] Dark/light mode toggle, or dark-only commitment?
- [ ] "Featured Capture" hero rotator — yes/no?

---

*Compiled by Hermes — Preciado Tech Web Pipeline v1.0*
*X data sourced via X API v2 recent search, 2026-06-09*
*X_BEARER_TOKEN: stored in shell env, not in this repo*
