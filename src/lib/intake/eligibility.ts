import { isNucleusSatisfied } from "./nucleus";
import type { ProjectBrief, SubmitPath } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function statedString(
  brief: ProjectBrief,
  fieldId: string,
): string | null {
  const rec = brief.fields[fieldId];
  if (!rec || rec.status !== "stated") return null;
  if (typeof rec.value !== "string") return null;
  const t = rec.value.trim();
  return t === "" ? null : t;
}

export function hasRequiredContact(brief: ProjectBrief): {
  ok: boolean;
  name: string | null;
  email: string | null;
  reasons: string[];
} {
  const reasons: string[] = [];
  const name = statedString(brief, "contact_name");
  const email = statedString(brief, "contact_email");
  if (!name) reasons.push("Your name is required before you can send.");
  if (!email) {
    reasons.push("Email is required before you can send.");
  } else if (!EMAIL_RE.test(email)) {
    reasons.push("Enter a valid email address.");
  }
  return {
    ok: reasons.length === 0,
    name,
    email: reasons.some((r) => r.includes("valid email")) ? null : email,
    reasons,
  };
}

/**
 * P11 + P17 (+ P8 path) submit eligibility.
 * All paths: on Review + required contact.
 * - full: nucleus OR fuller (opened review with contact)
 * - graceful_finish: nucleus (Finish path)
 * - contact_first: nucleus (problem/objective ≥12) + contact (P8)
 */
export function evaluateSubmitEligibility(
  brief: ProjectBrief,
  opts: { onReview: boolean; path?: SubmitPath },
): {
  ok: boolean;
  reasons: string[];
  nucleus: boolean;
  fuller: boolean;
  path: SubmitPath;
} {
  const path: SubmitPath = opts.path ?? "full";
  const reasons: string[] = [];
  if (!opts.onReview) {
    reasons.push("Open Review before sending your project request.");
  }
  const contact = hasRequiredContact(brief);
  if (!contact.ok) {
    reasons.push(...contact.reasons);
  }
  const nucleus = isNucleusSatisfied(brief);
  const fuller = opts.onReview && contact.ok;

  if (path === "graceful_finish" || path === "contact_first") {
    if (!nucleus) {
      reasons.push(
        "Add a short description of the problem or goal before sending.",
      );
    }
    const ok = opts.onReview && contact.ok && nucleus;
    return {
      ok,
      reasons: ok ? [] : [...new Set(reasons)],
      nucleus,
      fuller,
      path,
    };
  }

  // full (T1)
  const ok = opts.onReview && contact.ok && (nucleus || fuller);
  return {
    ok,
    reasons: ok ? [] : [...new Set(reasons)],
    nucleus,
    fuller,
    path,
  };
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
