import { chromium } from "playwright";
import fs from "fs";

const base = process.env.HOME_URL || "https://raiderdigital.dev";
const shots =
  "C:/Projects/raiderdigital.dev/docs/visual-reference/brand-ux-v1/playwright-intake-t1";
fs.mkdirSync(shots, { recursive: true });

async function saveField(page, id, value) {
  const field = page.locator(`#field-${id}`);
  await field.waitFor({ state: "visible", timeout: 30000 });
  await field.fill(value);
  // Save is first button in the field's actions row
  const row = field.locator("xpath=following-sibling::div[1]");
  await row.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForTimeout(300);
}

async function openIntake(page) {
  const url = `${base}/project-intake?cb=${Date.now()}`;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    await page.goto(url + `&a=${attempt}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    try {
      await page.waitForSelector('[data-testid="enter-review"]', {
        timeout: 15000,
      });
      return;
    } catch {
      // CDN may briefly serve stale shell; retry.
    }
  }
  throw new Error("Timed out waiting for T1 enter-review control");
}

async function runFlow(page, label, fields) {
  await openIntake(page);
  await page.waitForSelector("#field-current_problem", { timeout: 45000 });

  const bodyText = await page.locator("body").innerText();
  const hasT0Jargon =
    /\bT0\b|this tranche|Mutation Gateway|Graceful Finish/i.test(bodyText);

  await saveField(page, "current_problem", fields.problem);
  await saveField(page, "contact_name", fields.name);
  await saveField(page, "contact_email", fields.email);

  const reviewBtn = page.getByTestId("enter-review");
  await reviewBtn.scrollIntoViewIfNeeded();
  await reviewBtn.click();
  await page.waitForSelector('[data-phase="review"]', { timeout: 30000 });
  const reviewText = await page.locator("body").innerText();
  const showsKnown =
    reviewText.includes(fields.name) &&
    reviewText.includes(fields.email) &&
    /website|intake|Mobile path|clearer/i.test(reviewText);

  await page.screenshot({
    path: `${shots}/live-${label}-review.png`,
    fullPage: true,
  });

  const sendBtn = page.getByTestId("submit-project-request");
  await sendBtn.scrollIntoViewIfNeeded();
  await sendBtn.click();
  await page.waitForSelector('[data-phase="submitted"]', { timeout: 30000 });
  await page.screenshot({
    path: `${shots}/live-${label}-submitted.png`,
    fullPage: true,
  });

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 2,
  );

  return { hasT0Jargon, showsKnown, overflow, submitted: true };
}

const browser = await chromium.launch();

const deskCtx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  ignoreHTTPSErrors: true,
});
const desktop = await deskCtx.newPage();
desktop.setDefaultTimeout(60000);
const d = await runFlow(desktop, "desktop", {
  problem: "We need a clearer website and intake for new customers.",
  name: "Alex Rivera",
  email: "alex@example.com",
});
await deskCtx.close();

const mobCtx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  ignoreHTTPSErrors: true,
});
const mobile = await mobCtx.newPage();
mobile.setDefaultTimeout(60000);
const m = await runFlow(mobile, "mobile", {
  problem: "Mobile path needs simple review and send.",
  name: "Sam Lee",
  email: "sam@example.com",
});
await mobCtx.close();

const homeCtx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const home = await homeCtx.newPage();
await home.goto(`${base}/?cb=${Date.now()}`, {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await home.waitForSelector("h1");
const homeOverflow = await home.evaluate(
  () =>
    document.documentElement.scrollWidth >
    document.documentElement.clientWidth + 2,
);
await home.locator('a[href="/project-intake"]').first().click();
await home.waitForURL("**/project-intake**");
const ctaOk = home.url().includes("project-intake");
await homeCtx.close();

console.log(
  JSON.stringify(
    {
      desktop: d,
      mobile: m,
      homepage: { ctaOk, homeOverflow },
      shots,
    },
    null,
    2,
  ),
);

await browser.close();
