import type { ProjectBrief } from "./types";
import { createSessionId } from "./session";

function nowIso(): string {
  return new Date().toISOString();
}

export function createEmptyBrief(sessionId?: string): ProjectBrief {
  const ts = nowIso();
  return {
    brief_id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `brief_${Date.now()}`,
    session_id: sessionId ?? createSessionId(),
    brief_version: 0,
    fields: {},
    derived_capabilities: [],
    created_at: ts,
    updated_at: ts,
  };
}
