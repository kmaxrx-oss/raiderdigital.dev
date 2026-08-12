/**
 * P13 session stub for T0.
 * Browser: sessionStorage. Non-browser (tests/SSR): stable ephemeral id argument.
 */

const STORAGE_KEY = "rd_intake_session_id";

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateBrowserSessionId(): string {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return createSessionId();
  }
  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = createSessionId();
    window.sessionStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return createSessionId();
  }
}
