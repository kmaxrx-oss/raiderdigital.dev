/** Forge v1.1 T0 — Project Brief core types (LOCAL_MIRROR of contract). */

export type FieldStatus = "stated" | "inferred" | "unknown";

export type FieldSource =
  | "visitor_form"
  | "visitor_chat"
  | "system_derived"
  | "system_unknown";

export type FieldValue = string | string[] | null;

export interface FieldRecord {
  field_id: string;
  value: FieldValue;
  status: FieldStatus;
  source: FieldSource;
  updated_at: string;
  last_mutation_id: string;
  /** Required for inferred patches (P4); unused on form stated in T0. */
  evidence_quote?: string;
}

/** Closed enum for later derived recompute (P9) — not customer stated facts. */
export type DerivedCapabilityId =
  | "web_development"
  | "seo"
  | "ux_ui_workflows"
  | "custom_software_workflow"
  | "other";

export interface ProjectBrief {
  brief_id: string;
  session_id: string;
  /** Monotonic; starts at 0 (P5). */
  brief_version: number;
  fields: Record<string, FieldRecord>;
  derived_capabilities: DerivedCapabilityId[];
  created_at: string;
  updated_at: string;
}

export type SetPatch = {
  op: "set";
  field_id: string;
  value: string | string[];
  status?: "stated" | "inferred";
  source?: FieldSource;
  evidence_quote?: string;
};

export type UnknownPatch = {
  op: "unknown";
  field_id: string;
  source?: "visitor_form" | "visitor_chat";
};

export type FieldPatch = SetPatch | UnknownPatch;

export type ApplyOk = {
  ok: true;
  brief: ProjectBrief;
  mutation_id: string;
};

export type ApplyErr = {
  ok: false;
  error: "REJECT_STALE" | "INVALID_FIELD" | "INVALID_PATCH" | "STATED_SHIELD";
  message: string;
};

export type ApplyResult = ApplyOk | ApplyErr;

/** Submit path flags (forge ProjectRequest.path). T1 uses `full` only. */
export type SubmitPath = "full" | "graceful_finish" | "contact_first";

export interface ConsolidatedField {
  field_id: string;
  label: string;
  value: FieldValue;
  status: FieldStatus;
}

/** Pure consolidate projection (P14) — organizes facts; invents nothing. */
export interface ConsolidatedView {
  known: ConsolidatedField[];
  unknown_field_ids: string[];
  empty_core_field_ids: string[];
}

export interface ProjectRequest {
  request_id: string;
  brief_id: string;
  session_id: string;
  path: SubmitPath;
  idempotency_key: string;
  brief_version: number;
  fields: Record<string, FieldRecord>;
  consolidated: ConsolidatedView;
  created_at: string;
}
