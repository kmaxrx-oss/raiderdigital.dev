import { CORE_FIELD_IDS, FIELD_LABELS, type CoreFieldId } from "./fields";
import type { ConsolidatedView, ProjectBrief } from "./types";

/**
 * P14 pure consolidate — organize known facts and unknowns; invent nothing.
 */
export function consolidateBrief(brief: ProjectBrief): ConsolidatedView {
  const known: ConsolidatedView["known"] = [];
  const unknown_field_ids: string[] = [];
  const seen = new Set<string>();

  for (const id of CORE_FIELD_IDS) {
    const rec = brief.fields[id];
    seen.add(id);
    if (!rec) continue;
    if (rec.status === "unknown") {
      unknown_field_ids.push(id);
      continue;
    }
    if (rec.status === "stated" || rec.status === "inferred") {
      known.push({
        field_id: id,
        label: FIELD_LABELS[id as CoreFieldId] ?? id,
        value: rec.value,
        status: rec.status,
      });
    }
  }

  // Any extra gateway-allowed keys not in CORE still surface if present.
  for (const [id, rec] of Object.entries(brief.fields)) {
    if (seen.has(id) || !rec) continue;
    if (rec.status === "unknown") {
      unknown_field_ids.push(id);
    } else if (rec.status === "stated" || rec.status === "inferred") {
      known.push({
        field_id: id,
        label: id,
        value: rec.value,
        status: rec.status,
      });
    }
  }

  const empty_core_field_ids = CORE_FIELD_IDS.filter((id) => !brief.fields[id]);

  return { known, unknown_field_ids, empty_core_field_ids };
}
