import { chromium } from "playwright";
import fs from "fs";

const base = process.env.HOME_URL || "http://127.0.0.1:3020";
const shots =
  "C:/Projects/raiderdigital.dev/docs/visual-reference/brand-ux-v1/playwright-home";
fs.mkdirSync(shots, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1440, height: 1100 });
await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60000 });
const h1 = await page.locator("h1").first().innerText();
const ctas = await page.locator('a[href="/project-intake"]').count();
const bgMedia = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      bg: cs.backgroundImage,
      size: cs.backgroundSize,
      position: cs.backgroundPosition,
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
    };
  };
  return {
    hero: pick('[class*="heroMediaSurface"]'),
    how: pick('[class*="howMediaSurface"]'),
    hasImgInHero: !!document.querySelector("section [class*='hero'] img"),
    hasImgInHow: !!document.querySelector("#how-it-works img"),
  };
});
await page.locator('a[href="/project-intake"]').first().click();
await page.waitForURL("**/project-intake", { timeout: 15000 });
const intakeOk = page.url().includes("project-intake");
const intakeHasForm = await page.locator("text=Your Project Brief").count();

await page.goto(`${base}/`, { waitUntil: "networkidle" });
await page.screenshot({ path: `${shots}/desktop-1440.png`, fullPage: true });
const overflowD = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
);

await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: `${shots}/mobile-390.png`, fullPage: true });
const overflowM = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
);
const bgMediaMobile = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      bg: cs.backgroundImage,
      size: cs.backgroundSize,
      position: cs.backgroundPosition,
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
    };
  };
  return {
    hero: pick('[class*="heroMediaSurface"]'),
    how: pick('[class*="howMediaSurface"]'),
  };
});
const bodyText = await page.locator("body").innerText();
const fake =
  /38%|94%|12\.4K|Trusted by businesses|CASE STUDY|507-000|star rating/i.test(
    bodyText,
  );
const services = await page.locator("#services h3").allInnerTexts();

console.log(
  JSON.stringify(
    {
      h1,
      ctas,
      intakeOk,
      intakeHasForm,
      overflowD,
      overflowM,
      fake,
      services,
      bgMedia,
      bgMediaMobile,
      shots,
    },
    null,
    2,
  ),
);

await browser.close();
