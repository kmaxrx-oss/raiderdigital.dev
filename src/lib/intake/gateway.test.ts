import { describe, expect, it } from "vitest";
import { createEmptyBrief } from "./createBrief";
import {
  applyFormSet,
  applyFormUnknown,
  applyMutation,
} from "./gateway";
import { isNucleusSatisfied } from "./nucleus";

describe("Mutation Gateway", () => {
  it("starts at brief_version 0", () => {
    const b = createEmptyBrief("sess-test");
    expect(b.brief_version).toBe(0);
    expect(Object.keys(b.fields)).toHaveLength(0);
  });

  it("increments version on successful apply", () => {
    const b0 = createEmptyBrief("s1");
    const r1 = applyFormSet(b0, 0, "business_name", "Washed Again");
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    expect(r1.brief.brief_version).toBe(1);
    expect(r1.brief.fields.business_name?.status).toBe("stated");
    expect(r1.brief.fields.business_name?.value).toBe("Washed Again");
    expect(r1.brief.fields.business_name?.source).toBe("visitor_form");
  });

  it("rejects stale base_version (P5)", () => {
    const b0 = createEmptyBrief("s1");
    const r1 = applyFormSet(b0, 0, "business_name", "Acme");
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    const stale = applyFormSet(r1.brief, 0, "business_type", "Laundry");
    expect(stale.ok).toBe(false);
    if (stale.ok) return;
    expect(stale.error).toBe("REJECT_STALE");
  });

  it("rejects unknown field ids", () => {
    const b0 = createEmptyBrief("s1");
    const r = applyMutation(b0, 0, [
      { op: "set", field_id: "not_a_real_field", value: "x" },
    ]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe("INVALID_FIELD");
  });

  it("marks field unknown via form path (P1)", () => {
    const b0 = createEmptyBrief("s1");
    const r = applyFormUnknown(b0, 0, "timing");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.brief.fields.timing?.status).toBe("unknown");
    expect(r.brief.fields.timing?.value).toBeNull();
    expect(r.brief.fields.timing?.source).toBe("visitor_form");
    expect(r.brief.brief_version).toBe(1);
  });

  it("blocks inferred overwrite of stated (P3 shield)", () => {
    const b0 = createEmptyBrief("s1");
    const r1 = applyFormSet(b0, 0, "current_tools", "WordPress");
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    const r2 = applyMutation(r1.brief, 1, [
      {
        op: "set",
        field_id: "current_tools",
        value: "Squarespace",
        status: "inferred",
        source: "visitor_chat",
        evidence_quote: "we use squarespace",
      },
    ]);
    expect(r2.ok).toBe(false);
    if (r2.ok) return;
    expect(r2.error).toBe("STATED_SHIELD");
  });

  it("requires evidence_quote for inferred (P4)", () => {
    const b0 = createEmptyBrief("s1");
    const r = applyMutation(b0, 0, [
      {
        op: "set",
        field_id: "business_type",
        value: "Laundry",
        status: "inferred",
        source: "visitor_chat",
      },
    ]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe("INVALID_PATCH");
  });

  it("applies multiple patches atomically with one version bump", () => {
    const b0 = createEmptyBrief("s1");
    const r = applyMutation(b0, 0, [
      { op: "set", field_id: "business_name", value: "Washed Again" },
      {
        op: "set",
        field_id: "current_problem",
        value: "Customers leave more laundry than they paid for online",
      },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.brief.brief_version).toBe(1);
    expect(r.brief.fields.business_name?.value).toBe("Washed Again");
    expect(r.brief.fields.current_problem?.status).toBe("stated");
  });
});

describe("nucleus P6", () => {
  it("is false on empty brief", () => {
    expect(isNucleusSatisfied(createEmptyBrief("s"))).toBe(false);
  });

  it("is true with problem >= 12 stated without business_name", () => {
    const b0 = createEmptyBrief("s");
    const r = applyFormSet(
      b0,
      0,
      "current_problem",
      "Customers leave more laundry than purchased",
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.brief.fields.business_name).toBeUndefined();
    expect(isNucleusSatisfied(r.brief)).toBe(true);
  });

  it("is false when problem text is too short", () => {
    const b0 = createEmptyBrief("s");
    const r = applyFormSet(b0, 0, "current_problem", "too short");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(isNucleusSatisfied(r.brief)).toBe(false);
  });
});
