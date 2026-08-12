import { chromium } from "playwright";
import fs from "fs";

const base = process.env.HOME_URL || "http://127.0.0.1:3020";
const shots =
  "C:/Projects/raiderdigital.dev/docs/visual-reference/brand-ux-v1/playwright-intake-t2";
fs.mkdirSync(shots, { recursive: true });

async function saveField(page, id, value) {
  const field = page.locator(`#field-${id}`);
  await field.fill(value);
  await field
    .locator("xpath=following-sibling::div[1]")
    .getByRole("button", { name: "Save", exact: true })
    .click();
  await page.waitForTimeout(200);
}

async function openIntake(page) {
  await page.goto(`${base}/project-intake?cb=${Date.now()}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector('[data-testid="enter-review"]', {
    timeout: 30000,
  });
}

const browser = await chromium.launch();
const results = {};

// Desktop: Finish path without business_name
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);
  await openIntake(page);
  const body0 = await page.locator("body").innerText();
  results.hasT0Jargon = /\bT0\b|Mutation Gateway|this tranche/i.test(body0);

  await saveField(
    page,
    "current_problem",
    "Need a booking workflow for walk-in customers today.",
  );
  // Finish without business_name
  await page.getByTestId("finish-with-what-i-have").click();
  // min contact
  await page.waitForSelector('[data-phase="finish-min-contact"]');
  await saveField(page, "contact_name", "Alex Rivera");
  await saveField(page, "contact_email", "alex@example.com");
  await page.getByTestId("finish-min-contact-continue").click();
  await page.waitForSelector('[data-phase="review"]');
  await page.getByTestId("submit-project-request").click();
  await page.waitForSelector('[data-phase="submitted"]');
  const pathText = await page.locator("body").innerText();
  results.finishPath = pathText.includes("graceful_finish");
  await page.screenshot({
    path: `${shots}/desktop-finish-submitted.png`,
    fullPage: true,
  });
  await ctx.close();
}

// Desktop: contact-first path
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);
  await openIntake(page);
  await page.getByTestId("contact-first").click();
  await page.waitForSelector('[data-phase="contact-first"]');
  await saveField(
    page,
    "current_problem",
    "Short note: website is confusing for new customers.",
  );
  await saveField(page, "contact_name", "Sam Lee");
  await saveField(page, "contact_email", "sam@example.com");
  await page.getByTestId("contact-first-continue").click();
  await page.waitForSelector('[data-phase="review"]');
  // Keep talking retains contact
  await page.getByTestId("keep-talking").click();
  await page.waitForSelector('[data-phase="edit"]');
  const nameVal = await page.locator("#field-contact_name").inputValue();
  results.contactRetained =
    nameVal.includes("Sam") ||
    (await page.locator("body").innerText()).includes("Sam Lee");
  // return to contact-first complete path quickly via finish now nucleus met
  await page.getByTestId("finish-with-what-i-have").click();
  // may go review directly if contact still in brief
  const phase = await page.locator("[data-phase]").first().getAttribute("data-phase");
  if (phase === "finish-min-contact") {
    await saveField(page, "contact_name", "Sam Lee");
    await saveField(page, "contact_email", "sam@example.com");
    await page.getByTestId("finish-min-contact-continue").click();
  }
  await page.waitForSelector('[data-phase="review"]');
  await page.getByTestId("submit-project-request").click();
  await page.waitForSelector('[data-phase="submitted"]');
  results.keepTalkingThenSubmit = true;
  await ctx.close();
}

// Mobile contact-first smoke
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);
  await openIntake(page);
  const cf = page.getByTestId("contact-first");
  await cf.scrollIntoViewIfNeeded();
  await cf.click();
  await page.waitForSelector('[data-phase="contact-first"]', { timeout: 45000 });
  await saveField(
    page,
    "current_problem",
    "Mobile short request for a local service site.",
  );
  await saveField(page, "contact_name", "Pat Kim");
  await saveField(page, "contact_email", "pat@example.com");
  await page.getByTestId("contact-first-continue").scrollIntoViewIfNeeded();
  await page.getByTestId("contact-first-continue").click();
  await page.waitForSelector('[data-phase="review"]', { timeout: 45000 });
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 2,
  );
  await page.getByTestId("submit-project-request").scrollIntoViewIfNeeded();
  await page.getByTestId("submit-project-request").click();
  await page.waitForSelector('[data-phase="submitted"]', { timeout: 45000 });
  const body = await page.locator("body").innerText();
  results.mobileContactFirst = body.includes("contact_first");
  results.overflowM = overflow;
  await page.screenshot({
    path: `${shots}/mobile-contact-first-submitted.png`,
    fullPage: true,
  });
  await ctx.close();
}

console.log(JSON.stringify({ ...results, shots }, null, 2));
await browser.close();
