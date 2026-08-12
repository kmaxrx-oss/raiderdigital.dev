import { describe, expect, it } from "vitest";
import { createEmptyBrief } from "./createBrief";
import { applyFormSet } from "./gateway";
import { isNucleusSatisfied } from "./nucleus";
import {
  canShowContactFirst,
  canShowFinish,
  phaseAfterFinishClick,
  phaseEnterContactFirst,
  phaseKeepTalking,
} from "./phases";
import {
  createIdempotencyStore,
  submitProjectRequest,
} from "./submit";

function withNucleusNoBusinessName() {
  let b = createEmptyBrief("s");
  let r = applyFormSet(
    b,
    0,
    "current_problem",
    "Need a booking workflow for walk-in customers.",
  );
  expect(r.ok).toBe(true);
  if (!r.ok) throw new Error("setup");
  return r.brief;
}

function withContact(b: ReturnType<typeof createEmptyBrief>) {
  let r = applyFormSet(b, b.brief_version, "contact_name", "Alex");
  expect(r.ok).toBe(true);
  if (!r.ok) throw new Error("setup");
  r = applyFormSet(r.brief, r.brief.brief_version, "contact_email", "a@x.com");
  expect(r.ok).toBe(true);
  if (!r.ok) throw new Error("setup");
  return r.brief;
}

describe("T2 phases + finish/contact-first", () => {
  it("Finish without business_name when nucleus met (P6)", () => {
    const b = withNucleusNoBusinessName();
    expect(isNucleusSatisfied(b)).toBe(true);
    expect(b.fields.business_name).toBeUndefined();
    expect(canShowFinish(b)).toBe(true);
    expect(canShowContactFirst(b)).toBe(false);
  });

  it("contact-first shown only pre-nucleus (P8)", () => {
    const empty = createEmptyBrief("e");
    expect(canShowContactFirst(empty)).toBe(true);
    expect(canShowFinish(empty)).toBe(false);
    expect(phaseEnterContactFirst().submitPath).toBe("contact_first");
  });

  it("P12 finish with contact already stated goes to review", () => {
    let b = withNucleusNoBusinessName();
    b = withContact(b);
    const next = phaseAfterFinishClick(b);
    expect(next.phase).toBe("READY_FOR_REVIEW");
    expect(next.submitPath).toBe("graceful_finish");
  });

  it("finish without contact requires min contact phase", () => {
    const b = withNucleusNoBusinessName();
    const next = phaseAfterFinishClick(b);
    expect(next.phase).toBe("FINISH_MIN_CONTACT");
    expect(next.submitPath).toBe("graceful_finish");
  });

  it("P7 keep talking returns to intake without needing to clear contact", () => {
    let b = withNucleusNoBusinessName();
    b = withContact(b);
    const name = b.fields.contact_name?.value;
    const email = b.fields.contact_email?.value;
    expect(phaseKeepTalking()).toBe("INTAKE_ACTIVE");
    // brief unchanged — contact retained
    expect(b.fields.contact_name?.value).toBe(name);
    expect(b.fields.contact_email?.value).toBe(email);
  });

  it("graceful_finish and contact_first use same ProjectRequest type + store", () => {
    const store = createIdempotencyStore();
    let b = withNucleusNoBusinessName();
    b = withContact(b);
    const a = submitProjectRequest({
      brief: b,
      idempotencyKey: "k-gf",
      path: "graceful_finish",
      onReview: true,
      store,
    });
    expect(a.ok).toBe(true);
    if (!a.ok) return;
    expect(a.request.path).toBe("graceful_finish");

    const b2 = submitProjectRequest({
      brief: b,
      idempotencyKey: "k-cf",
      path: "contact_first",
      onReview: true,
      store,
    });
    expect(b2.ok).toBe(true);
    if (!b2.ok) return;
    expect(b2.request.path).toBe("contact_first");
    // same shape
    expect(b2.request).toHaveProperty("consolidated");
    expect(b2.request).toHaveProperty("brief_id");
  });

  it("path=full still works (T1)", () => {
    let b = withNucleusNoBusinessName();
    b = withContact(b);
    const r = submitProjectRequest({
      brief: b,
      idempotencyKey: "k-full",
      path: "full",
      onReview: true,
      store: createIdempotencyStore(),
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.request.path).toBe("full");
  });
});
