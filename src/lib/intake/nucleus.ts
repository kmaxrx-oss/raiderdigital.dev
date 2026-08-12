import type { ProjectBrief } from "./types";

const NUCLEUS_TEXT_FIELDS = [
  "primary_objective",
  "current_problem",
  "desired_outcome",
] as const;

const MIN_LEN = 12;

/**
 * P6 Option A — nucleus without requiring business_name / business_type.
 * At least one of objective / problem / outcome is stated with length ≥ 12.
 */
export function isNucleusSatisfied(brief: ProjectBrief): boolean {
  for (const id of NUCLEUS_TEXT_FIELDS) {
    const rec = brief.fields[id];
    if (!rec || rec.status !== "stated") continue;
    if (typeof rec.value !== "string") continue;
    if (rec.value.trim().length >= MIN_LEN) return true;
  }
  return false;
}

export const NUCLEUS_MIN_LENGTH = MIN_LEN;
