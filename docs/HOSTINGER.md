# Hostinger deployment notes

## Target shape

Hostinger should deploy **this repository root** as the Node web application — not the seo-bot monorepo.

## Expected commands

```bash
npm ci
npm run build   # next build --webpack (required on Hostinger shared Node: native SWC/Turbopack needs GLIBC_2.29)
npm run start
```

Set `PORT` if the panel injects a non-default port.  
Optional: `NEXT_PUBLIC_SITE_URL=https://raiderdigital.dev`

Deploy path: Hostinger Node JS app for domain `raiderdigital.dev` (archive or GitHub source at repo root). Do not treat static-only Empty HTML as the production path.

## What this is not

- Not an “Empty HTML / static dist only” Astro upload (Star Glass pattern)  
- Not nested under `managed-sites/raiderdigital.dev` on the host  

## Connect GitHub → Hostinger

1. Push this repo to GitHub (see README).  
2. In Hostinger, create/link a **Node.js** web app (or equivalent) with root = repository root.  
3. Build command: `npm run build`  
4. Start command: `npm run start`  
5. Point domain `raiderdigital.dev` at the app.  

SFTP to `public_html` alone is **not** the preferred path for this stack; prefer Node app hosting. If only static hosting is available, a separate export strategy must be designed later — do not silently switch to static and drop Route Handlers.
