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

Forge / dual-lane / T0 packet live under:

```text
seo-bot/managed-sites/raiderdigital.dev/
```

T0 (`ProjectBrief`, Mutation Gateway, form projection) executes **here** after OPEN-TRANCHE names this repo’s paths.

## Environment

Copy `.env.example` → `.env.local` as needed. Never commit secrets.
