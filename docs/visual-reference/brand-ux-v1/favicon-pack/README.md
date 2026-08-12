# Raider favicon pack (production)

**Source:** Operator `Downloads/raider-favicon-pack.zip` (filed 2026-08-12)  
**Brand:** Raider Digital LED face mark (not Travel Time)  
**Live install:** app `public/` + `src/app/favicon.ico` + `layout.tsx` icons/manifest

## Modern package (shipped)

| File | Role |
|------|------|
| `favicon.ico` | Legacy multi-size ICO |
| `favicon-16x16.png` | Tab 16 |
| `favicon-32x32.png` | Tab 32 |
| `favicon-48x48.png` | Optional mid |
| `apple-touch-icon.png` | 180×180 iOS home |
| `android-chrome-192x192.png` | PWA / Android 192 |
| `android-chrome-512x512.png` | PWA / Android 512 |
| `site.webmanifest` | Web app manifest |

## Not in this zip

- `favicon.svg` — not supplied; add when vector mark is locked, then prefer SVG in `icons` before PNG.

## Provenance

Byte copies of the Operator zip live in this folder for ledger. Deploy path uses `public/` copies.
