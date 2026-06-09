# Mario Preciado Photography

> **Capturing live moments & Visuals.** — Live music, street, fashion, portraiture, and community photography based in the Bay Area, CA.

[![Live Site](https://img.shields.io/badge/Live_Site-ff10f0?style=for-the-badge&logo=vercel&logoColor=white)](https://mario-preciado-rebuild.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/michaelpreciado/mario-preciado-photography)
[![Instagram](https://img.shields.io/badge/Instagram-000?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/mariopreciado.art)

---

## 📸 About the Project

A complete rebuild of Mario Preciado's photography portfolio — from an existing Vercel deployment to a production-grade, accessible, high-performance site. Built as the first end-to-end test of the **Preciado Tech Web Pipeline**: a repeatable workflow for scraping client assets, rebuilding with modern tooling, and deploying at scale.

### The Client

**Mario Preciado** is a Bay Area-based photographer specializing in:
- **Live Music** — Concert and performance photography
- **Street** — Urban and candid documentation
- **Fashion** — Editorial and styled shoots
- **Portraiture** — Character-driven portraits
- **Community** — Event and culture coverage

---

## 🎬 Build Documentation

A 25-second hyperframe video documenting the full build process — from scaffold to deployment.

[![Build Video](https://img.shields.io/badge/Watch_Build_Video-ff10f0?style=for-the-badge&logo=video&logoColor=white)](build-doc-video/renders/build-doc-video_2026-06-09_00-04-00.mp4)

*Dark, futuristic terminal-style animation showing each step of the pipeline.*

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (Custom Properties), JavaScript (ES6+) |
| **Styling** | Tailwind CSS (CDN), Custom neon-pink design system |
| **Animations** | GSAP (GreenSock Animation Platform) |
| **Fonts** | Inter (headings), JetBrains Mono (code/terminal) |
| **Deployment** | Vercel (CI/CD via GitHub) |
| **Version Control** | Git + GitHub |
| **AI Assistance** | Claude Sonnet 4.6 (via Claude Code CLI) |
| **Video** | HyperFrames (HTML-to-MP4 composition engine) |
| **Research** | X API v2 (design trend analysis) |

---

## 🚀 Pipeline Workflow

This project was built using the **Preciado Tech Web Pipeline** — a repeatable 5-phase process:

```
1. DISCOVERY  →  Scrape client assets (images, text, social links)
2. SCAFFOLD   →  Initialize project, deploy preview to Vercel
3. ENHANCE    →  Claude Code (Sonnet 4.6) implements features
4. POLISH     →  UX debug pass, accessibility audit, performance optimization
5. DELIVER    →  Final deploy, build documentation video, client handoff
```

### What was built (6 enhancement passes)

| Pass | Feature | Details |
|---|---|---|
| 1 | **Lightbox** | Fullscreen image viewer with keyboard nav, touch swipe, focus trap |
| 2 | **Featured Capture** | Editorial poster module with neon pink accents |
| 3 | **SEO + OG** | Meta tags, Open Graph, Twitter Card, JSON-LD Person schema |
| 4 | **Accessibility** | Skip-link, ARIA labels, focus indicators, reduced motion |
| 5 | **Performance** | Critical CSS, preconnect, deferred scripts, lazy loading |
| 6 | **UX Debug** | 11 bugs fixed — mobile menu, scroll, nav links, hero fallback |
| 7 | **Instagram Feed** | "From the Feed" section + responsive 4/2/1-col grid styles for [@preciado.tech](https://www.instagram.com/preciado.tech/). The live 12-post pull is wired but pending — Instagram rate-limited the fetch at build time, so the section ships a "Follow" CTA fallback until the images are dropped in |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--neon-pink` | `#ff10f0` | Primary accent, text glow, borders |
| `--bg-black` | `#000000` | Background |
| `--text-primary` | `#ffffff` | Body text |
| `--text-secondary` | `#a1a1aa` | Secondary/meta text |
| `--border-subtle` | `#27272a` | Subtle borders |
| Font | Inter (sans-serif) | Headings and body |
| Font | JetBrains Mono | Code elements |

---

## 📁 Project Structure

```
mario-preciado-photography/
├── index.html              # Main entry point
├── css/
│   └── style.css           # Core styles + design system
├── js/
│   └── main.js             # Portfolio grid, lightbox, animations
├── assets/
│   └── images/             # 13 scraped photographs (hero + portfolio)
│       └── instagram/      # reserved for @preciado.tech feed (insta_001–012.webp) — pending pull
├── build-doc-video/        # HyperFrames video project
│   ├── index.html          # Video composition
│   └── renders/            # Rendered MP4 output
├── inspiration.md          # X API research brief
├── HANDOFF.md              # Claude Code handoff package
└── README.md               # This file
```

---

## 🔗 Links

- **Live Site:** https://mario-preciado-rebuild.vercel.app
- **GitHub:** https://github.com/michaelpreciado/mario-preciado-photography
- **Instagram:** https://www.instagram.com/mariopreciado.art
- **Original Site:** https://photography-portfolio-chi-nine.vercel.app (legacy)

---

## 📄 License

All photographs © Mario Preciado. All rights reserved.
Code and pipeline workflow © Preciado Tech.

---

*Built with the Preciado Tech Web Pipeline — Scrape · Rebuild · Deploy · Scale*

---

## Improvements Pipeline

- [~] Instagram scraping — "From the Feed" section + grid styles are built and deployed with a "Follow" CTA fallback. The live 12-post pull (`instaloader` from @preciado.tech) was rate-limited at build time; rerun it to populate `insta_001–012.webp` and swap the CTA for the grid. Swap the username to source from @mariopreciado.art once the client is ready
- [ ] Custom domain — map `mariopreciado.art` or TBD custom domain to the Vercel deployment
- [ ] Google Places lead gen — scrape local venues/photographers, run each through the pipeline, deploy as a preview network on `preciado-tech.com`
- [ ] Preview deployments — set up per-branch Vercel preview URLs for iterating on client changes before going live
- [ ] Analytics — add privacy-respecting analytics (Plausible or Vercel Analytics) to track visitors and popular portfolio images