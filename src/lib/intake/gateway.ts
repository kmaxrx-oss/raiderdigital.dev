import { isAllowedFieldId } from "./fields";
import type {
  ApplyResult,
  FieldPatch,
  FieldRecord,
  ProjectBrief,
  SetPatch,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function mutationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mut_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function cloneBrief(brief: ProjectBrief): ProjectBrief {
  return {
    ...brief,
    fields: { ...brief.fields },
    derived_capabilities: [...brief.derived_capabilities],
  };
}

function normalizeEvidence(quote: string | undefined): string | undefined {
  if (quote == null) return undefined;
  return quote.replace(/\s+/g, " ").trim();
}

/**
 * Single Mutation Gateway (I3, I14, P5).
 * Serial application is the caller's responsibility for concurrent async;
 * each apply is atomic on the returned brief snapshot.
 */
export function applyMutation(
  brief: ProjectBrief,
  baseVersion: number,
  patches: FieldPatch[],
): ApplyResult {
  if (baseVersion !== brief.brief_version) {
    return {
      ok: false,
      error: "REJECT_STALE",
      message: `base_version ${baseVersion} != brief_version ${brief.brief_version}`,
    };
  }

  if (!Array.isArray(patches) || patches.length === 0) {
    return {
      ok: false,
      error: "INVALID_PATCH",
      message: "patches must be a non-empty array",
    };
  }

  const mid = mutationId();
  const next = cloneBrief(brief);
  const ts = nowIso();

  for (const patch of patches) {
    if (!patch || typeof patch !== "object" || !("op" in patch)) {
      return {
        ok: false,
        error: "INVALID_PATCH",
        message: "malformed patch",
      };
    }

    if (!isAllowedFieldId(patch.field_id)) {
      return {
        ok: false,
        error: "INVALID_FIELD",
        message: `field not allowed: ${patch.field_id}`,
      };
    }

    if (patch.op === "unknown") {
      const rec: FieldRecord = {
        field_id: patch.field_id,
        value: null,
        status: "unknown",
        source: patch.source ?? "visitor_form",
        updated_at: ts,
        last_mutation_id: mid,
      };
      next.fields[patch.field_id] = rec;
      continue;
    }

    if (patch.op === "set") {
      const setPatch = patch as SetPatch;
      const status = setPatch.status ?? "stated";
      const source =
        setPatch.source ??
        (status === "inferred" ? "visitor_chat" : "visitor_form");

      if (status === "inferred") {
        const quote = normalizeEvidence(setPatch.evidence_quote);
        if (!quote) {
          return {
            ok: false,
            error: "INVALID_PATCH",
            message: "inferred patches require evidence_quote (P4)",
          };
        }
      }

      // P3 stated shield: inferred must not overwrite stated
      const existing = next.fields[patch.field_id];
      if (
        existing?.status === "stated" &&
        status === "inferred"
      ) {
        return {
          ok: false,
          error: "STATED_SHIELD",
          message: `cannot overwrite stated field ${patch.field_id} with inferred`,
        };
      }

      let value = setPatch.value;
      if (typeof value === "string") {
        value = value.trim();
        if (value.length === 0) {
          return {
            ok: false,
            error: "INVALID_PATCH",
            message: "set value must be non-empty string or use unknown op",
          };
        }
      } else if (Array.isArray(value)) {
        value = value.map((v) => String(v).trim()).filter(Boolean);
        if (value.length === 0) {
          return {
            ok: false,
            error: "INVALID_PATCH",
            message: "set array value must be non-empty",
          };
        }
      } else {
        return {
          ok: false,
          error: "INVALID_PATCH",
          message: "set value must be string or string[]",
        };
      }

      const rec: FieldRecord = {
        field_id: patch.field_id,
        value,
        status,
        source,
        updated_at: ts,
        last_mutation_id: mid,
      };
      if (status === "inferred" && setPatch.evidence_quote) {
        rec.evidence_quote = normalizeEvidence(setPatch.evidence_quote);
      }
      next.fields[patch.field_id] = rec;
      continue;
    }

    return {
      ok: false,
      error: "INVALID_PATCH",
      message: `unknown op`,
    };
  }

  next.brief_version = brief.brief_version + 1;
  next.updated_at = ts;

  return { ok: true, brief: next, mutation_id: mid };
}

/** Form helper: set one field as visitor_form stated. */
export function applyFormSet(
  brief: ProjectBrief,
  baseVersion: number,
  fieldId: string,
  value: string,
): ApplyResult {
  return applyMutation(brief, baseVersion, [
    {
      op: "set",
      field_id: fieldId,
      value,
      status: "stated",
      source: "visitor_form",
    },
  ]);
}

/** Form helper: mark field unknown (P1). */
export function applyFormUnknown(
  brief: ProjectBrief,
  baseVersion: number,
  fieldId: string,
): ApplyResult {
  return applyMutation(brief, baseVersion, [
    {
      op: "unknown",
      field_id: fieldId,
      source: "visitor_form",
    },
  ]);
}
