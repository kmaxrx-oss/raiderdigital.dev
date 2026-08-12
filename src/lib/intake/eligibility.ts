import { isNucleusSatisfied } from "./nucleus";
import type { ProjectBrief } from "./types";

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
 * P11 + P17 submit eligibility for form-only path=full.
 * Requires: on Review, required contact, and (nucleus OR fuller path).
 * Fuller path (T1): visitor opened Review with required contact present
 * (even if non-contact fields remain unknown/empty).
 */
export function evaluateSubmitEligibility(
  brief: ProjectBrief,
  opts: { onReview: boolean },
): { ok: boolean; reasons: string[]; nucleus: boolean; fuller: boolean } {
  const reasons: string[] = [];
  if (!opts.onReview) {
    reasons.push("Open Review before sending your project request.");
  }
  const contact = hasRequiredContact(brief);
  if (!contact.ok) {
    reasons.push(...contact.reasons);
  }
  const nucleus = isNucleusSatisfied(brief);
  // Fuller: on Review with contact present (P11).
  const fuller = opts.onReview && contact.ok;
  if (opts.onReview && contact.ok && !nucleus && !fuller) {
    reasons.push("Add a bit more about the problem or goal before sending.");
  }
  // With fuller = onReview && contact, the block above never fires when contact ok.
  // Nucleus is soft for fuller path; keep for readiness messaging only.
  const ok = opts.onReview && contact.ok && (nucleus || fuller);
  return { ok, reasons: ok ? [] : reasons, nucleus, fuller };
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
