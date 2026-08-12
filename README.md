# raiderdigital.dev

**Deployable Raider Digital web application** — homepage shell + Project Intake route foundation.

| Layer | Location |
|-------|----------|
| **This repo** | Application code, build, Hostinger Node root |
| **Product law** | `seo-bot` → `managed-sites/raiderdigital.dev` (Forge, inventory, OPEN-TRANCHE) |

Do **not** implement product wedges inside the seo-bot documentation workspace.

## Stack

**Next.js App Router + TypeScript + React + Vitest**

Selected for co-located UI + Route Handlers (Mutation Gateway / submit), not because Star Glass uses Astro.  
See [docs/STACK-SELECTION.md](./docs/STACK-SELECTION.md).

## Local

```bash
npm ci
npm run dev      # http://localhost:3000
npm run build
npm run start    # production server
npm test
npm run lint
```

## Routes (shell)

| Path | Role |
|------|------|
| `/` | Homepage shell |
| `/project-intake` | Intake surface (T0+ product behavior under OPEN-TRANCHE) |
| 404 | `not-found` |

## Hostinger

Repository **root** is the app. See [docs/HOSTINGER.md](./docs/HOSTINGER.md).

```bash
npm ci && npm run build && npm run start
```

## Product authority

Forge / dual-lane / OPEN-TRANCHE / GATE live under:

```text
seo-bot/managed-sites/raiderdigital.dev/
```

Thin app contract: [`AGENTS.md`](./AGENTS.md).

Product behavior (including intake) requires the applicable **OPEN-TRANCHE** from the managed site. Do not invent SEO claims or product facts in this repo alone.

## SEO authority

| Concern | Where |
|---------|--------|
| Content architecture / page owners | Managed site `foundation/` + page-builder gate |
| Methodology | `seo-bot/toolkit/TACTICAL-SEO-METHODOLOGY.md`, playbooks |
| New/material pages | `seo-page-builder-gate` then `seo-page-closure-gate` |
| Implementation of meta/schema/llms | This app, only after contract |

## Visual reference

| Path | Role |
|------|------|
| [`docs/visual-reference/brand-ux-v1/`](./docs/visual-reference/brand-ux-v1/) | Brand/UX mockups (3 PNGs) |
| [`REFERENCE.md`](./docs/visual-reference/brand-ux-v1/REFERENCE.md) | Strong-not-absolute law |

Mockup-governed UI: skill `mockup-guided-ui-build` (seo-bot). Inspect images before build; Playwright compare later. Do not ship sample metrics/clients from mockups as facts.

## Environment

Copy `.env.example` → `.env.local` as needed. Never commit secrets.
