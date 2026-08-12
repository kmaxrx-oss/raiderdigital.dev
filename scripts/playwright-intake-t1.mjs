import { chromium } from "playwright";
import fs from "fs";

const base = process.env.HOME_URL || "http://127.0.0.1:3020";
const shots =
  "C:/Projects/raiderdigital.dev/docs/visual-reference/brand-ux-v1/playwright-intake-t1";
fs.mkdirSync(shots, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(45000);

async function fillAndSave(id, value) {
  const field = page.locator(`#field-${id}`);
  await field.fill(value);
  await field.locator("xpath=..").getByRole("button", { name: "Save" }).click();
}

// Desktop flow
await page.setViewportSize({ width: 1440, height: 1100 });
await page.goto(`${base}/project-intake`, { waitUntil: "networkidle" });
const bodyText = await page.locator("body").innerText();
const hasT0Jargon =
  /\bT0\b|this tranche|Mutation Gateway|Graceful Finish|implementation-stage/i.test(
    bodyText,
  );

await fillAndSave(
  "current_problem",
  "We need a clearer website and intake for new customers.",
);
await fillAndSave("contact_name", "Alex Rivera");
await fillAndSave("contact_email", "alex@example.com");
await page.locator('[data-testid="enter-review"]').click();
await page.waitForSelector('[data-phase="review"]');
await page.screenshot({ path: `${shots}/desktop-review.png`, fullPage: true });
await page.locator('[data-testid="submit-project-request"]').click();
await page.waitForSelector('[data-phase="submitted"]');
const desktopSubmitted = await page.locator("text=Request sent").count();
await page.screenshot({
  path: `${shots}/desktop-submitted.png`,
  fullPage: true,
});

// Mobile flow (fresh session via new context)
const mobile = await browser.newPage();
mobile.setDefaultTimeout(45000);
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(`${base}/project-intake`, { waitUntil: "networkidle" });
async function fillMobile(id, value) {
  const field = mobile.locator(`#field-${id}`);
  await field.fill(value);
  await field.locator("xpath=..").getByRole("button", { name: "Save" }).click();
}
await fillMobile(
  "current_problem",
  "Mobile intake path needs a simple form to review and send.",
);
await fillMobile("contact_name", "Sam Lee");
await fillMobile("contact_email", "sam@example.com");
await mobile.locator('[data-testid="enter-review"]').click();
await mobile.waitForSelector('[data-phase="review"]');
const overflowM = await mobile.evaluate(
  () =>
    document.documentElement.scrollWidth >
    document.documentElement.clientWidth + 2,
);
await mobile.screenshot({ path: `${shots}/mobile-review.png`, fullPage: true });
await mobile.locator('[data-testid="submit-project-request"]').click();
await mobile.waitForSelector('[data-phase="submitted"]');
const mobileSubmitted = await mobile.locator("text=Request sent").count();

console.log(
  JSON.stringify(
    {
      hasT0Jargon,
      desktopSubmitted: desktopSubmitted > 0,
      mobileSubmitted: mobileSubmitted > 0,
      overflowM,
      shots,
    },
    null,
    2,
  ),
);

await browser.close();
