import { describe, expect, it } from "vitest";
import { createEmptyBrief } from "./createBrief";
import { applyFormSet, applyFormUnknown } from "./gateway";
import { consolidateBrief } from "./consolidate";
import {
  createIdempotencyStore,
  submitProjectRequest,
} from "./submit";

function briefReadyForSubmit() {
  let b = createEmptyBrief("sess-t1");
  let r = applyFormSet(
    b,
    0,
    "current_problem",
    "We need a clearer website and intake for new customers.",
  );
  expect(r.ok).toBe(true);
  if (!r.ok) throw new Error("setup");
  b = r.brief;
  r = applyFormSet(b, b.brief_version, "contact_name", "Alex Rivera");
  expect(r.ok).toBe(true);
  if (!r.ok) throw new Error("setup");
  b = r.brief;
  r = applyFormSet(b, b.brief_version, "contact_email", "alex@example.com");
  expect(r.ok).toBe(true);
  if (!r.ok) throw new Error("setup");
  return r.brief;
}

describe("T1 consolidate + idempotent submit", () => {
  it("pure consolidate lists known and unknown without inventing", () => {
    let b = createEmptyBrief("s");
    let r = applyFormSet(b, 0, "business_name", "Acme");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    b = r.brief;
    r = applyFormSet(b, b.brief_version, "current_problem", "x".repeat(12));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const u = applyFormUnknown(r.brief, r.brief.brief_version, "timing");
    expect(u.ok).toBe(true);
    if (!u.ok) return;
    const c = consolidateBrief(u.brief);
    expect(c.known.some((k) => k.field_id === "business_name")).toBe(true);
    expect(c.unknown_field_ids).toContain("timing");
    expect(c.known.every((k) => k.value !== undefined)).toBe(true);
  });

  it("double POST same Idempotency-Key yields one ProjectRequest (P2)", () => {
    const store = createIdempotencyStore();
    const brief = briefReadyForSubmit();
    const key = "idem-test-1";
    const a = submitProjectRequest({
      brief,
      idempotencyKey: key,
      onReview: true,
      store,
    });
    const b = submitProjectRequest({
      brief,
      idempotencyKey: key,
      onReview: true,
      store,
    });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.deduped).toBe(false);
    expect(b.deduped).toBe(true);
    expect(a.request.request_id).toBe(b.request.request_id);
    expect(a.request.path).toBe("full");
    expect(store.size).toBe(1);
  });

  it("submit failure preserves brief and leaves key free for retry", () => {
    const store = createIdempotencyStore();
    const brief = briefReadyForSubmit();
    const key = "idem-fail-then-ok";
    const versionBefore = brief.brief_version;
    const fail = submitProjectRequest({
      brief,
      idempotencyKey: key,
      onReview: true,
      store,
      forceFail: true,
    });
    expect(fail.ok).toBe(false);
    if (fail.ok) return;
    expect(fail.briefPreserved).toBe(true);
    expect(brief.brief_version).toBe(versionBefore);
    expect(store.has(key)).toBe(false);

    const ok = submitProjectRequest({
      brief,
      idempotencyKey: key,
      onReview: true,
      store,
    });
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.request.idempotency_key).toBe(key);
  });

  it("requires Idempotency-Key", () => {
    const brief = briefReadyForSubmit();
    const r = submitProjectRequest({
      brief,
      idempotencyKey: "",
      onReview: true,
      store: createIdempotencyStore(),
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe("MISSING_IDEMPOTENCY_KEY");
  });

  it("blocks submit when not on Review", () => {
    const brief = briefReadyForSubmit();
    const r = submitProjectRequest({
      brief,
      idempotencyKey: "k2",
      onReview: false,
      store: createIdempotencyStore(),
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe("NOT_ELIGIBLE");
  });

  it("requires email (P17)", () => {
    let b = createEmptyBrief("s");
    let r = applyFormSet(
      b,
      0,
      "current_problem",
      "Need a booking workflow for staff.",
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    b = r.brief;
    r = applyFormSet(b, b.brief_version, "contact_name", "Sam");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const sub = submitProjectRequest({
      brief: r.brief,
      idempotencyKey: "k3",
      onReview: true,
      store: createIdempotencyStore(),
    });
    expect(sub.ok).toBe(false);
    if (sub.ok) return;
    expect(sub.error).toBe("NOT_ELIGIBLE");
  });
});
