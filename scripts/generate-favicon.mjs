/**
 * Generate multi-size favicon.ico + optimized PNG icons from the Raider mark.
 * Usage: node scripts/generate-favicon.mjs
 *
 * Prefers production-candidate raider-favicon-1.png; falls back to public mark.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const candidates = [
  path.join(
    root,
    "docs/visual-reference/brand-ux-v1/production-candidates/raider-favicon-1.png",
  ),
  path.join(root, "public/images/raider/favicon-mark.png"),
];
const src = candidates.find((p) => fs.existsSync(p));
if (!src) {
  console.error("No favicon source found");
  process.exit(1);
}

async function png(size) {
  return sharp(src)
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
}

const sizes = [16, 32, 48];
const bufs = [];
for (const s of sizes) {
  const b = await png(s);
  bufs.push(b);
  fs.writeFileSync(path.join(root, "public", `favicon-${s}x${s}.png`), b);
}
fs.copyFileSync(
  path.join(root, "public/favicon-32x32.png"),
  path.join(root, "public/favicon.png"),
);

const ico = await toIco(bufs);
fs.writeFileSync(path.join(root, "src/app/favicon.ico"), ico);
fs.writeFileSync(path.join(root, "public/favicon.ico"), ico);

fs.writeFileSync(path.join(root, "public/apple-touch-icon.png"), await png(180));
fs.writeFileSync(
  path.join(root, "public/images/raider/favicon-mark.png"),
  await png(192),
);

console.log("source", src);
console.log("favicon.ico", ico.length, "bytes");
console.log("favicon-32x32.png", bufs[1].length, "bytes");
console.log("apple-touch-icon.png 180");
console.log("favicon-mark.png 192");
