# Production graphic candidates — asset ledger

**Filed:** 2026-08-12  
**Path:** `docs/visual-reference/brand-ux-v1/production-candidates/`  
**Source:** Operator Downloads (byte-preserved)  
**Mockup authority:** `../` homepage mockups + `../REFERENCE.md` (strong, not absolute)  
**Homepage contract:** seo-bot `foundation/content-architecture/homepage/CONTENT-OWNER-CONTRACT.md`  
**Mode:** asset intake only — no homepage implement; no `public/images` ship this pass  

## Inspection law

Every file was opened and visually inspected (not filename-only).  
`mockup-guided-ui-build` loaded: these are **ingredients** inside brand-ux-v1, not license to redesign the homepage.

## Multiple-option law

Where two assets share a job: **keep both**; pick during mockup-guided build; unused stays for child pages / later. Homepage is not a graphic gallery.

## Alpha note

| PixelFormat (source inspect) | Meaning for compositing |
|------------------------------|-------------------------|
| Format24bppRgb | Opaque bitmap (black or light solid bg) |
| Format32bppArgb | Alpha channel present; may still show solid black/white in practice |

---

## Ledger

| filename | dims | bg / alpha | visual subject | best candidate job | alternate for | shipping suitability |
|----------|------|------------|----------------|--------------------|---------------|----------------------|
| `raider-logo-1.png` | 1254×1254 | Opaque black | Stacked cyan LED face + RAIDER DIGITAL | Square mark (already also in `../logo/`) | Favicon source if face crop preferred | **Ship** — logo/social/mobile; match prior logo system |
| `raider-logo-2.png` | 1536×1024 | Opaque black | Horizontal LED face left + wordmark | Horizontal mark (header/footer) | — | **Ship** — nav/footer |
| `raider-favicon-1.png` | 1254×1254 | Opaque black, rounded square | LED face only (no wordmark) | Favicon / app icon / avatar | Tiny icon variant | **Ship** — preferred favicon over full wordmark square |
| `raider-assistant.png` | 1024×1536 | Dark studio; ARGB | Full cowboy/robot Raider Bot, welcome pose | Hero character **and/or** CTA/helper | Secondary pose if hero needs different crop | **Ship** — primary Bot identity; no fabricated metrics |
| `raider-ux-1.png` | 1254×1254 | Black; ARGB | Abstract phone + admin UI workflow composition | Service card **UX/UI & Workflows** (or Web Dev soft) | General “systems” illustration | **Ship with care** — decorative UI chrome only; **not** product screenshot truth |
| `raider-ux-2.png` | 2816×1536 | Light opaque | Infographic “UX/UI & WORKFLOWS” customer vs ops | Service / workflows education section | Child page `/ux-ui-workflows` hero | **Ship with care** — **baked title/labels**; page H2/copy must not depend on image OCR; good light-section match to mockups |
| `raider-service-workflow-1.png` | 1536×1024 | Dark; ARGB | Phone form → route → dashboard (booking ops) | Service/workflow demo (dark band) | Child workflows page | **Caution** — heavy **demo UI text** (“Book Now”, “Get Started Today”, inbox counts); do not treat as real product UI or claims; crop/use as mood only or prefer cleaner candidate |
| `raider-service-workflow-2.png` | 2816×1536 | Light opaque | Customer journey vs business ops bridge diagram | Service pillar **UX/UI & Workflows** or process story | Child page | **Ship with care** — marketing diagram; labels are illustrative not SOPs |
| `raider-digital-workflow-1.png` | 3712×1152 | Transparent checker + white cards | 4-step: Needs → Plan → Build → Deploy | Optional process strip (generic delivery) | About/process later | **Ship** — clean; wide aspect for strip; **HTML owns final step copy** if it differs from image |
| `raider-digital-workflow-2.png` | 2172×724 | Light opaque | 4-step: Tell Raider → Project Brief → Build → Get Found | **How project start / intake** section | Process strip | **Ship preferred for intake story** — aligns with product wedge; still treat labels as design, lock public copy in HTML |

---

## Pairings (multi-option jobs)

| Job | Candidates | Homepage selection note |
|-----|------------|-------------------------|
| Logo square | logo-1 (also `../logo/`), favicon-1 for face-only | Prefer **logo-1** for branded square; **favicon-1** for browser icon |
| Logo horizontal | logo-2 (also `../logo/`) | Single horizontal reference |
| Hero / Bot identity | **assistant** only in this batch | No second full-character option here |
| UX / workflows service visual | **ux-1** vs **ux-2** vs service-workflow-1/2 | Prefer **ux-2** or **service-workflow-2** on light canvas mockups; **ux-1** on dark cards; avoid shipping both on homepage |
| Process / how-we-work strip | **digital-workflow-1** vs **digital-workflow-2** | Prefer **digital-workflow-2** for Tell Raider → Brief story; **workflow-1** if generic delivery narrative |
| Intake demonstration | digital-workflow-2 (narrative); service-workflow-1 (UI-heavy, risky) | Prefer **digital-workflow-2**; service-workflow-1 only if cropped of claim-heavy chrome |

---

## Gaps vs homepage PAGE BUILD graphics jobs

| Contract job | Status in this batch |
|--------------|----------------------|
| Raider Bot hero character | **Covered** — `raider-assistant.png` |
| Project Intake demonstration | **Partial** — workflow-2 tells intake story; no dual-panel Chat+Brief chrome mock (may still use workflow-2 or mockup UI chrome in implement) |
| Service graphic Web Development | **Weak / missing pure icon** — no dedicated web-dev mark; may reuse abstract UI from ux-1 or line-icon in CSS until dedicated asset |
| Service graphic SEO | **Missing pure icon** — “Get Found” step in workflow-2 is narrative only; may need simple icon at implement or later asset |
| Service graphic UX/UI & Workflows | **Covered** — ux-1 / ux-2 / service-workflow pair |
| CTA / guide Bot pose | **Covered** by assistant (same asset as hero; crop/scale) |
| Favicon | **Covered** — favicon-1 |
| Process strip | **Covered** — digital-workflow pair |

---

## Problematic / flag

| Asset | Issue | Action |
|-------|--------|--------|
| `raider-service-workflow-1.png` | Dense fabricated product UI + marketing CTAs in image | Do not present as live Raider software; prefer alternate or severe crop |
| `raider-ux-2.png` | Large baked “RAIDER DIGITAL / UX/UI & WORKFLOWS” headline | OK as section art if HTML H2 is real owner of title; do not OCR as sole heading |
| `raider-digital-workflow-*.png` | Step microcopy baked in | HTML section copy is authority; image is illustration |
| All workflow diagrams | Invented example UI/data | Decorative only |

**None** of the ten files are unusable as **decorative brand ingredients**.  
**None** may become factual proof, metrics, or live product documentation.

---

## Prior assets not overwritten

| Path | Role |
|------|------|
| `../bb7ab893-….png` etc. | Homepage mockups |
| `../logo/raider-logo-*.png` | Prior logo references (same binaries as candidates) |
| `../REFERENCE.md` | Brand + logo system law |

---

## Shipping path (later implement only)

When homepage build selects an asset:

1. Keep original here (or in `../logo/`).  
2. Place optimized copy under `public/images/raider/` (create at implement).  
3. Do not destroy the only source copy.

---

## Stop

Asset intake complete. Ready for **authorized mockup-guided homepage build + Playwright** against PAGE BUILD CONTRACT READY — not auto-started this pass.
