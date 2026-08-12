# Stack selection — Raider Digital application

**Date:** 2026-08-12  
**Workspace:** `C:\Projects\raiderdigital.dev` (deployable app)  
**Authority (product law):** `seo-bot/managed-sites/raiderdigital.dev` (Forge / inventory — not this repo)

## Selected for

Public marketing shell **plus** a long-lived, stateful **Project Brief / chat** intake (Forge v1.1): Mutation Gateway, sessions, form projection, later guest-safe LLM extract tools, single submit API.

## Candidates considered

| Option | Fit | Reject reason |
|--------|-----|---------------|
| Astro static (Star Glass specimen) | Strong marketing SSG; islands for widgets | Stateful intake + co-located host API becomes second system; would re-create Star Glass dual-surface risk by default |
| Vite SPA + separate API | Fine UI | Two deploy roots on Hostinger; worse for single-repo Hostinger shape |
| **Next.js App Router + TypeScript** | One repo root: routes, RSC/client, **Route Handlers** for gateway/submit, cookies for session | — |

## Decision

**Next.js (App Router) + React + TypeScript + Vitest**

Not chosen because Star Glass uses Astro. Chosen because Forge requires **guest browser + host API** in one causal product, Hostinger can treat **repository root** as the Node app (`npm run build` / `npm run start`), and T0+ unit tests live next to product code.

## Explicit non-inheritance

- No Star Glass package ladder, brand, or dual submit authorities  
- No seo-bot monorepo as deploy root  
- Product law stays in managed-sites; code here implements it under OPEN-TRANCHE  

## Hostinger shape

```text
repo root
  package.json
  next.config.ts
  src/app/...
npm ci
npm run build
npm run start   # respects PORT
```
