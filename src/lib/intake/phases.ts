import { isNucleusSatisfied } from "./nucleus";
import { hasRequiredContact } from "./eligibility";
import type { ProjectBrief, SubmitPath } from "./types";

/**
 * Interaction phases (forge §8–10). Guest-facing labels are separate.
 */
export type InteractionPhase =
  | "INTAKE_ACTIVE"
  | "CONTACT_FIRST"
  | "FINISH_MIN_CONTACT"
  | "READY_FOR_REVIEW"
  | "SUBMITTED";

export const PHASE_GUEST_LABEL: Record<InteractionPhase, string> = {
  INTAKE_ACTIVE: "Editing your brief",
  CONTACT_FIRST: "Short request",
  FINISH_MIN_CONTACT: "Add contact to finish",
  READY_FOR_REVIEW: "Review before send",
  SUBMITTED: "Sent",
};

/** Finish control (post-nucleus only). */
export function canShowFinish(brief: ProjectBrief): boolean {
  return isNucleusSatisfied(brief);
}

/** Contact-first micro-path (pre-nucleus). */
export function canShowContactFirst(brief: ProjectBrief): boolean {
  return !isNucleusSatisfied(brief);
}

/**
 * After user chooses Finish: P12 skip min contact when already stated.
 */
export function phaseAfterFinishClick(brief: ProjectBrief): {
  phase: InteractionPhase;
  submitPath: SubmitPath;
} {
  const contact = hasRequiredContact(brief);
  if (contact.ok) {
    return { phase: "READY_FOR_REVIEW", submitPath: "graceful_finish" };
  }
  return { phase: "FINISH_MIN_CONTACT", submitPath: "graceful_finish" };
}

/**
 * After user chooses contact-first entry (pre-nucleus).
 */
export function phaseEnterContactFirst(): {
  phase: InteractionPhase;
  submitPath: SubmitPath;
} {
  return { phase: "CONTACT_FIRST", submitPath: "contact_first" };
}

/**
 * P7 Keep talking: return to intake without mutating the brief
 * (caller must not clear contact_* fields).
 */
export function phaseKeepTalking(): InteractionPhase {
  return "INTAKE_ACTIVE";
}

export function phaseEnterFullReview(): {
  phase: InteractionPhase;
  submitPath: SubmitPath;
} {
  return { phase: "READY_FOR_REVIEW", submitPath: "full" };
}

export function phaseAfterContactFirstReady(brief: ProjectBrief): {
  ok: boolean;
  phase?: InteractionPhase;
  reasons: string[];
} {
  const contact = hasRequiredContact(brief);
  const nucleus = isNucleusSatisfied(brief);
  const reasons: string[] = [];
  if (!contact.ok) reasons.push(...contact.reasons);
  if (!nucleus) {
    reasons.push(
      "Add a short description of the problem or goal (at least a sentence).",
    );
  }
  if (reasons.length) return { ok: false, reasons };
  return { ok: true, phase: "READY_FOR_REVIEW", reasons: [] };
}

export function phaseAfterFinishMinContact(brief: ProjectBrief): {
  ok: boolean;
  phase?: InteractionPhase;
  reasons: string[];
} {
  const contact = hasRequiredContact(brief);
  if (!contact.ok) return { ok: false, reasons: contact.reasons };
  if (!isNucleusSatisfied(brief)) {
    return {
      ok: false,
      reasons: ["Describe the work a bit more before finishing."],
    };
  }
  return { ok: true, phase: "READY_FOR_REVIEW", reasons: [] };
}
