import { consolidateBrief } from "./consolidate";
import { evaluateSubmitEligibility } from "./eligibility";
import type { ProjectBrief, ProjectRequest, SubmitPath } from "./types";

export type IdempotencyStore = Map<string, ProjectRequest>;

export function createIdempotencyStore(): IdempotencyStore {
  return new Map();
}

/** Process-local store for T1 (single Node process). */
const globalStore: IdempotencyStore =
  (globalThis as unknown as { __rdIdempotency?: IdempotencyStore })
    .__rdIdempotency ?? createIdempotencyStore();

(globalThis as unknown as { __rdIdempotency?: IdempotencyStore }).__rdIdempotency =
  globalStore;

export function getDefaultIdempotencyStore(): IdempotencyStore {
  return globalStore;
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function buildProjectRequest(
  brief: ProjectBrief,
  opts: { idempotencyKey: string; path: SubmitPath },
): ProjectRequest {
  const consolidated = consolidateBrief(brief);
  return {
    request_id: newId("req"),
    brief_id: brief.brief_id,
    session_id: brief.session_id,
    path: opts.path,
    idempotency_key: opts.idempotencyKey,
    brief_version: brief.brief_version,
    fields: { ...brief.fields },
    consolidated,
    created_at: new Date().toISOString(),
  };
}

export type SubmitOk = {
  ok: true;
  request: ProjectRequest;
  deduped: boolean;
};

export type SubmitErr = {
  ok: false;
  error:
    | "MISSING_IDEMPOTENCY_KEY"
    | "NOT_ELIGIBLE"
    | "INVALID_PATH"
    | "INVALID_BRIEF"
    | "SIMULATED_FAILURE";
  message: string;
  reasons?: string[];
  /** Brief is never mutated by submit — caller keeps their snapshot. */
  briefPreserved: true;
};

export type SubmitResult = SubmitOk | SubmitErr;

/**
 * Idempotent submit (P2). Double POST same key → one ProjectRequest.
 * Failure paths do not mutate the brief (P: failure preserve).
 */
export function submitProjectRequest(input: {
  brief: ProjectBrief;
  idempotencyKey: string;
  path?: SubmitPath;
  onReview: boolean;
  store?: IdempotencyStore;
  /** Test-only: force failure after eligibility (brief still preserved). */
  forceFail?: boolean;
}): SubmitResult {
  const key = String(input.idempotencyKey || "").trim();
  if (key === "") {
    return {
      ok: false,
      error: "MISSING_IDEMPOTENCY_KEY",
      message: "Idempotency-Key is required.",
      briefPreserved: true,
    };
  }

  const path: SubmitPath = input.path ?? "full";
  if (
    path !== "full" &&
    path !== "graceful_finish" &&
    path !== "contact_first"
  ) {
    return {
      ok: false,
      error: "INVALID_PATH",
      message: "Unsupported submit path.",
      briefPreserved: true,
    };
  }

  if (!input.brief || typeof input.brief.brief_id !== "string") {
    return {
      ok: false,
      error: "INVALID_BRIEF",
      message: "A Project Brief is required.",
      briefPreserved: true,
    };
  }

  const store = input.store ?? getDefaultIdempotencyStore();
  const existing = store.get(key);
  if (existing) {
    return { ok: true, request: existing, deduped: true };
  }

  const elig = evaluateSubmitEligibility(input.brief, {
    onReview: input.onReview,
    path,
  });
  if (!elig.ok) {
    return {
      ok: false,
      error: "NOT_ELIGIBLE",
      message: "Project request is not ready to send.",
      reasons: elig.reasons,
      briefPreserved: true,
    };
  }

  if (input.forceFail) {
    return {
      ok: false,
      error: "SIMULATED_FAILURE",
      message: "Submit failed. Your brief is unchanged — try again.",
      briefPreserved: true,
    };
  }

  const request = buildProjectRequest(input.brief, {
    idempotencyKey: key,
    path,
  });
  store.set(key, request);
  return { ok: true, request, deduped: false };
}
