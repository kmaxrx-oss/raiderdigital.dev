"use client";

import { useCallback, useMemo, useState } from "react";
import {
  applyFormSet,
  applyFormUnknown,
  consolidateBrief,
  createEmptyBrief,
  evaluateSubmitEligibility,
  FORM_FIELD_IDS,
  FIELD_LABELS,
  getOrCreateBrowserSessionId,
  isNucleusSatisfied,
  type CoreFieldId,
  type ProjectBrief,
  type ProjectRequest,
} from "@/lib/intake";
import styles from "./ProjectBriefForm.module.css";

type Phase = "edit" | "review" | "submitted";

const IDEM_STORAGE = "rd_intake_submit_idempotency_key";

function fieldDisplay(brief: ProjectBrief, id: CoreFieldId): string {
  const rec = brief.fields[id];
  if (!rec) return "";
  if (rec.status === "unknown") return "";
  if (rec.value == null) return "";
  if (Array.isArray(rec.value)) return rec.value.join(", ");
  return rec.value;
}

function statusLabel(brief: ProjectBrief, id: CoreFieldId): string {
  const rec = brief.fields[id];
  if (!rec) return "empty";
  if (rec.status === "stated") return "Saved";
  if (rec.status === "inferred") return "Noted";
  if (rec.status === "unknown") return "Still needed / unknown";
  return rec.status;
}

function getOrCreateIdempotencyKey(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.sessionStorage.getItem(IDEM_STORAGE);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `idem_${Date.now()}`;
    window.sessionStorage.setItem(IDEM_STORAGE, id);
    return id;
  } catch {
    return `idem_${Date.now()}`;
  }
}

function clearIdempotencyKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(IDEM_STORAGE);
  } catch {
    /* ignore */
  }
}

export function ProjectBriefForm() {
  const [brief, setBrief] = useState<ProjectBrief>(() =>
    createEmptyBrief(
      typeof window !== "undefined"
        ? getOrCreateBrowserSessionId()
        : "ssr-pending",
    ),
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [lastError, setLastError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("edit");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<ProjectRequest | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const nucleus = useMemo(() => isNucleusSatisfied(brief), [brief]);
  const consolidated = useMemo(() => consolidateBrief(brief), [brief]);
  const eligibility = useMemo(
    () => evaluateSubmitEligibility(brief, { onReview: phase === "review" }),
    [brief, phase],
  );

  const onChangeDraft = useCallback((id: CoreFieldId, value: string) => {
    setDrafts((d) => ({ ...d, [id]: value }));
  }, []);

  const commitField = useCallback(
    (id: CoreFieldId) => {
      const raw =
        drafts[id] !== undefined ? drafts[id] : fieldDisplay(brief, id);
      const trimmed = raw.trim();
      if (!trimmed) {
        setLastError("Enter a value, or mark as unknown.");
        return;
      }
      const result = applyFormSet(brief, brief.brief_version, id, trimmed);
      if (!result.ok) {
        setLastError(result.message);
        return;
      }
      setBrief(result.brief);
      setDrafts((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
      setLastError(null);
    },
    [brief, drafts],
  );

  const markUnknown = useCallback(
    (id: CoreFieldId) => {
      const result = applyFormUnknown(brief, brief.brief_version, id);
      if (!result.ok) {
        setLastError(result.message);
        return;
      }
      setBrief(result.brief);
      setDrafts((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
      setLastError(null);
    },
    [brief],
  );

  const enterReview = useCallback(() => {
    const elig = evaluateSubmitEligibility(brief, { onReview: true });
    if (!elig.ok) {
      setLastError(elig.reasons.join(" "));
      return;
    }
    setPhase("review");
    setLastError(null);
    if (!idempotencyKey) {
      setIdempotencyKey(getOrCreateIdempotencyKey());
    }
  }, [brief, idempotencyKey]);

  const backToEdit = useCallback(() => {
    setPhase("edit");
    setLastError(null);
  }, []);

  const sendRequest = useCallback(async () => {
    const key = idempotencyKey || getOrCreateIdempotencyKey();
    if (!idempotencyKey) setIdempotencyKey(key);
    setSubmitting(true);
    setLastError(null);
    try {
      const res = await fetch("/api/project-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: JSON.stringify({
          brief,
          path: "full",
          onReview: true,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        request?: ProjectRequest;
        message?: string;
        reasons?: string[];
        error?: string;
      };
      if (!data.ok || !data.request) {
        setLastError(
          [data.message, ...(data.reasons || [])].filter(Boolean).join(" ") ||
            "Could not send. Your brief is unchanged — try again.",
        );
        return;
      }
      setSubmitted(data.request);
      setPhase("submitted");
      clearIdempotencyKey();
    } catch {
      setLastError(
        "Could not send right now. Your brief is unchanged — try again with the same request.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [brief, idempotencyKey]);

  const startNewRequest = useCallback(() => {
    clearIdempotencyKey();
    setIdempotencyKey("");
    setSubmitted(null);
    setPhase("edit");
    setBrief(
      createEmptyBrief(
        typeof window !== "undefined"
          ? getOrCreateBrowserSessionId()
          : "ssr-pending",
      ),
    );
    setDrafts({});
    setLastError(null);
  }, []);

  if (phase === "submitted" && submitted) {
    return (
      <div className={styles.wrap} data-phase="submitted">
        <div className={styles.success} role="status">
          <h2 className={styles.h2}>Request sent</h2>
          <p className={styles.help}>
            Thanks — Raider has your project request. We will follow up using the
            contact details you provided.
          </p>
          <p className={styles.metaLine}>
            Reference: <strong>{submitted.request_id.slice(0, 8)}</strong>
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={startNewRequest}
          >
            Start another request
          </button>
        </div>
      </div>
    );
  }

  if (phase === "review") {
    return (
      <div className={styles.wrap} data-phase="review">
        <div className={styles.meta} aria-live="polite">
          <span>
            Ready to send:{" "}
            <strong className={eligibility.ok ? styles.ok : styles.warn}>
              {eligibility.ok ? "yes" : "not yet"}
            </strong>
          </span>
        </div>

        {lastError ? (
          <p className={styles.error} role="alert">
            {lastError}
          </p>
        ) : null}

        <section className={styles.form} aria-label="Review project request">
          <h2 className={styles.h2}>Review your Project Brief</h2>
          <p className={styles.help}>
            Confirm what you are sending. Nothing is invented — only what you
            saved on the form.
          </p>

          <h3 className={styles.h3}>What you told Raider</h3>
          {consolidated.known.length === 0 ? (
            <p className={styles.help}>No saved facts yet.</p>
          ) : (
            <ul className={styles.panelList}>
              {consolidated.known.map((row) => (
                <li key={row.field_id}>
                  <span className={styles.panelLabel}>{row.label}</span>
                  <span className={styles.panelValue}>
                    {Array.isArray(row.value)
                      ? row.value.join(", ")
                      : String(row.value ?? "")}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {consolidated.unknown_field_ids.length > 0 ? (
            <>
              <h3 className={styles.h3}>Marked unknown</h3>
              <ul className={styles.panelList}>
                {consolidated.unknown_field_ids.map((id) => (
                  <li key={id}>
                    <span className={styles.panelLabel}>
                      {FIELD_LABELS[id as CoreFieldId] ?? id}
                    </span>
                    <span className={styles.panelValue}>Unknown</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <div className={styles.actions} style={{ marginTop: "1.25rem" }}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={backToEdit}
              disabled={submitting}
            >
              Back to edit
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={sendRequest}
              disabled={submitting || !eligibility.ok}
              data-testid="submit-project-request"
            >
              {submitting ? "Sending…" : "Send project request"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.wrap} data-phase="edit">
      <div className={styles.meta} aria-live="polite">
        <span>
          Progress:{" "}
          <strong className={nucleus ? styles.ok : styles.warn}>
            {nucleus ? "enough to describe the work" : "add the core problem or goal"}
          </strong>
        </span>
      </div>

      {lastError ? (
        <p className={styles.error} role="alert">
          {lastError}
        </p>
      ) : null}

      <div className={styles.grid}>
        <section className={styles.form} aria-label="Project Brief form">
          <h2 className={styles.h2}>Fill in your Project Brief</h2>
          <p className={styles.help}>
            Save each field as you go. When name and email are saved and you
            have described the work, review and send one clear request.
          </p>
          {FORM_FIELD_IDS.map((id) => {
            const committed = brief.fields[id];
            const value =
              drafts[id] !== undefined ? drafts[id] : fieldDisplay(brief, id);
            const isUnknown = committed?.status === "unknown";
            return (
              <div key={id} className={styles.field}>
                <label htmlFor={`field-${id}`} className={styles.label}>
                  {FIELD_LABELS[id]}
                  {id === "contact_email" || id === "contact_name"
                    ? " (required to send)"
                    : ""}
                </label>
                <p className={styles.status}>{statusLabel(brief, id)}</p>
                <textarea
                  id={`field-${id}`}
                  className={styles.input}
                  rows={
                    id === "current_problem" || id === "customer_actions" ? 3 : 2
                  }
                  value={isUnknown && drafts[id] === undefined ? "" : value}
                  placeholder={
                    isUnknown ? "Marked unknown — type to set a value" : undefined
                  }
                  onChange={(e) => onChangeDraft(id, e.target.value)}
                  data-testid={`field-${id}`}
                />
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => commitField(id)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => markUnknown(id)}
                  >
                    Mark unknown
                  </button>
                </div>
              </div>
            );
          })}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={enterReview}
              data-testid="enter-review"
            >
              Review and send
            </button>
          </div>
        </section>

        <aside className={styles.panel} aria-label="Brief summary">
          <h2 className={styles.h2}>Live brief</h2>
          <p className={styles.help}>
            One Project Brief for this visit — what you save appears here.
          </p>
          <ul className={styles.panelList}>
            {FORM_FIELD_IDS.map((id) => {
              const rec = brief.fields[id];
              return (
                <li key={id}>
                  <span className={styles.panelLabel}>{FIELD_LABELS[id]}</span>
                  <span className={styles.panelValue}>
                    {!rec
                      ? "—"
                      : rec.status === "unknown"
                        ? "Unknown"
                        : rec.status === "stated"
                          ? `${Array.isArray(rec.value) ? rec.value.join(", ") : rec.value}`
                          : `${Array.isArray(rec.value) ? rec.value.join(", ") : rec.value}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
