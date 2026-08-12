import { chromium } from "playwright";
import fs from "fs";

const base = process.env.HOME_URL || "https://raiderdigital.dev";
const shots =
  "C:/Projects/raiderdigital.dev/docs/visual-reference/brand-ux-v1/playwright-home";
fs.mkdirSync(shots, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(60000);

await page.setViewportSize({ width: 1440, height: 1100 });
await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector("h1", { timeout: 30000 });
const h1 = await page.locator("h1").first().innerText();
const ctas = await page.locator('a[href="/project-intake"]').count();
const bg = await page.evaluate(() => {
  const els = [
    ...document.querySelectorAll(
      '[class*="heroMediaSurface"], [class*="howMediaSurface"]',
    ),
  ];
  return els.map((el) => {
    const cs = getComputedStyle(el);
    return {
      cls: el.className,
      bg: cs.backgroundImage.slice(0, 100),
      size: cs.backgroundSize,
      pos: cs.backgroundPosition,
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
    };
  });
});
const overflowD = await page.evaluate(
  () =>
    document.documentElement.scrollWidth >
    document.documentElement.clientWidth + 2,
);
await page.screenshot({
  path: `${shots}/live-desktop-1440.png`,
  fullPage: true,
});

await page.setViewportSize({ width: 390, height: 844 });
const overflowM = await page.evaluate(
  () =>
    document.documentElement.scrollWidth >
    document.documentElement.clientWidth + 2,
);
await page.screenshot({
  path: `${shots}/live-mobile-390.png`,
  fullPage: true,
});

await page.locator('a[href="/project-intake"]').first().click();
await page.waitForURL("**/project-intake", { timeout: 30000 });
const intakeOk = page.url().includes("project-intake");

console.log(
  JSON.stringify(
    { h1, ctas, bg, overflowD, overflowM, intakeOk, shots },
    null,
    2,
  ),
);
await browser.close();
