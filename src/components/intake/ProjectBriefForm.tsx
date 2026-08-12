"use client";

import { useCallback, useMemo, useState } from "react";
import {
  applyFormSet,
  applyFormUnknown,
  canShowContactFirst,
  canShowFinish,
  consolidateBrief,
  createEmptyBrief,
  evaluateSubmitEligibility,
  FORM_FIELD_IDS,
  FIELD_LABELS,
  getOrCreateBrowserSessionId,
  isNucleusSatisfied,
  phaseAfterFinishClick,
  phaseAfterFinishMinContact,
  phaseAfterContactFirstReady,
  phaseEnterContactFirst,
  phaseEnterFullReview,
  phaseKeepTalking,
  PHASE_GUEST_LABEL,
  type CoreFieldId,
  type InteractionPhase,
  type ProjectBrief,
  type ProjectRequest,
  type SubmitPath,
} from "@/lib/intake";
import styles from "./ProjectBriefForm.module.css";

const IDEM_STORAGE = "rd_intake_submit_idempotency_key";

const CONTACT_FIELD_IDS: CoreFieldId[] = ["contact_name", "contact_email"];
const CONTACT_FIRST_FIELD_IDS: CoreFieldId[] = [
  "current_problem",
  "primary_objective",
  "contact_name",
  "contact_email",
];

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
  const [interactionPhase, setInteractionPhase] =
    useState<InteractionPhase>("INTAKE_ACTIVE");
  const [submitPath, setSubmitPath] = useState<SubmitPath>("full");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<ProjectRequest | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const nucleus = useMemo(() => isNucleusSatisfied(brief), [brief]);
  const consolidated = useMemo(() => consolidateBrief(brief), [brief]);
  const onReview = interactionPhase === "READY_FOR_REVIEW";
  const eligibility = useMemo(
    () =>
      evaluateSubmitEligibility(brief, {
        onReview,
        path: submitPath,
      }),
    [brief, onReview, submitPath],
  );

  const showFinish = canShowFinish(brief);
  const showContactFirst = canShowContactFirst(brief);

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

  const ensureIdemKey = useCallback(() => {
    if (idempotencyKey) return idempotencyKey;
    const key = getOrCreateIdempotencyKey();
    setIdempotencyKey(key);
    return key;
  }, [idempotencyKey]);

  const enterFullReview = useCallback(() => {
    const next = phaseEnterFullReview();
    const elig = evaluateSubmitEligibility(brief, {
      onReview: true,
      path: next.submitPath,
    });
    if (!elig.ok) {
      setLastError(elig.reasons.join(" "));
      return;
    }
    setSubmitPath(next.submitPath);
    setInteractionPhase(next.phase);
    ensureIdemKey();
    setLastError(null);
  }, [brief, ensureIdemKey]);

  const onFinish = useCallback(() => {
    if (!canShowFinish(brief)) {
      setLastError("Add a bit more about the problem or goal first.");
      return;
    }
    const next = phaseAfterFinishClick(brief);
    setSubmitPath(next.submitPath);
    setInteractionPhase(next.phase);
    ensureIdemKey();
    setLastError(null);
  }, [brief, ensureIdemKey]);

  const onContactFirst = useCallback(() => {
    const next = phaseEnterContactFirst();
    setSubmitPath(next.submitPath);
    setInteractionPhase(next.phase);
    setLastError(null);
  }, []);

  const continueFromContactFirst = useCallback(() => {
    const next = phaseAfterContactFirstReady(brief);
    if (!next.ok || !next.phase) {
      setLastError(next.reasons.join(" "));
      return;
    }
    setInteractionPhase(next.phase);
    ensureIdemKey();
    setLastError(null);
  }, [brief, ensureIdemKey]);

  const continueFromFinishMinContact = useCallback(() => {
    const next = phaseAfterFinishMinContact(brief);
    if (!next.ok || !next.phase) {
      setLastError(next.reasons.join(" "));
      return;
    }
    setInteractionPhase(next.phase);
    ensureIdemKey();
    setLastError(null);
  }, [brief, ensureIdemKey]);

  /** P7 Keep talking — never clears contact_* (brief state untouched). */
  const keepTalking = useCallback(() => {
    setInteractionPhase(phaseKeepTalking());
    setLastError(null);
  }, []);

  const sendRequest = useCallback(async () => {
    const key = ensureIdemKey();
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
          path: submitPath,
          onReview: true,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        request?: ProjectRequest;
        message?: string;
        reasons?: string[];
      };
      if (!data.ok || !data.request) {
        setLastError(
          [data.message, ...(data.reasons || [])].filter(Boolean).join(" ") ||
            "Could not send. Your brief is unchanged — try again.",
        );
        return;
      }
      setSubmitted(data.request);
      setInteractionPhase("SUBMITTED");
      clearIdempotencyKey();
    } catch {
      setLastError(
        "Could not send right now. Your brief is unchanged — try again with the same request.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [brief, ensureIdemKey, submitPath]);

  const startNewRequest = useCallback(() => {
    clearIdempotencyKey();
    setIdempotencyKey("");
    setSubmitted(null);
    setInteractionPhase("INTAKE_ACTIVE");
    setSubmitPath("full");
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

  const renderFields = (ids: CoreFieldId[]) =>
    ids.map((id) => {
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
    });

  if (interactionPhase === "SUBMITTED" && submitted) {
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
            {" · "}
            Path: <strong>{submitted.path}</strong>
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

  if (interactionPhase === "READY_FOR_REVIEW") {
    return (
      <div className={styles.wrap} data-phase="review">
        <div className={styles.meta} aria-live="polite">
          <span>
            {PHASE_GUEST_LABEL.READY_FOR_REVIEW}
            {" · "}
            Ready:{" "}
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
            saved.
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
              onClick={keepTalking}
              disabled={submitting}
              data-testid="keep-talking"
            >
              Keep talking
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

  if (interactionPhase === "FINISH_MIN_CONTACT") {
    return (
      <div className={styles.wrap} data-phase="finish-min-contact">
        <div className={styles.meta}>
          <span>{PHASE_GUEST_LABEL.FINISH_MIN_CONTACT}</span>
        </div>
        {lastError ? (
          <p className={styles.error} role="alert">
            {lastError}
          </p>
        ) : null}
        <section className={styles.form}>
          <h2 className={styles.h2}>Almost done</h2>
          <p className={styles.help}>
            Add your name and email so Raider can follow up. Your brief is kept
            as-is.
          </p>
          {renderFields(CONTACT_FIELD_IDS)}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={keepTalking}
            >
              Keep talking
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={continueFromFinishMinContact}
              data-testid="finish-min-contact-continue"
            >
              Continue to review
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (interactionPhase === "CONTACT_FIRST") {
    return (
      <div className={styles.wrap} data-phase="contact-first">
        <div className={styles.meta}>
          <span>{PHASE_GUEST_LABEL.CONTACT_FIRST}</span>
        </div>
        {lastError ? (
          <p className={styles.error} role="alert">
            {lastError}
          </p>
        ) : null}
        <section className={styles.form}>
          <h2 className={styles.h2}>Short project request</h2>
          <p className={styles.help}>
            Leave a short description and your contact. You can add more detail
            later — this is still one Project Brief, not a separate form.
          </p>
          {renderFields(CONTACT_FIRST_FIELD_IDS)}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={keepTalking}
            >
              Back to full brief
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={continueFromContactFirst}
              data-testid="contact-first-continue"
            >
              Continue to review
            </button>
          </div>
        </section>
      </div>
    );
  }

  // INTAKE_ACTIVE
  return (
    <div className={styles.wrap} data-phase="edit">
      <div className={styles.meta} aria-live="polite">
        <span>
          Progress:{" "}
          <strong className={nucleus ? styles.ok : styles.warn}>
            {nucleus
              ? "enough to describe the work"
              : "add the core problem or goal"}
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
            Save each field as you go. When you are ready, review and send one
            clear request.
          </p>
          {renderFields(FORM_FIELD_IDS)}

          <div className={styles.actions} data-testid="intake-actions">
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={enterFullReview}
              data-testid="enter-review"
            >
              Review and send
            </button>
            {showFinish ? (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={onFinish}
                data-testid="finish-with-what-i-have"
              >
                Finish with what I have
              </button>
            ) : null}
            {showContactFirst ? (
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={onContactFirst}
                data-testid="contact-first"
              >
                Short request with contact
              </button>
            ) : null}
          </div>
          {!showFinish && showContactFirst ? (
            <p className={styles.help} style={{ marginTop: "0.75rem" }}>
              Prefer a shorter path? Use a short request with your contact, or
              keep filling the brief until Finish appears.
            </p>
          ) : null}
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
