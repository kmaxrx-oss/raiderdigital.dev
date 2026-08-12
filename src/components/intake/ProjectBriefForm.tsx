"use client";

import { useCallback, useMemo, useState } from "react";
import {
  applyFormSet,
  applyFormUnknown,
  createEmptyBrief,
  FORM_FIELD_IDS,
  FIELD_LABELS,
  getOrCreateBrowserSessionId,
  isNucleusSatisfied,
  type CoreFieldId,
  type ProjectBrief,
} from "@/lib/intake";
import styles from "./ProjectBriefForm.module.css";

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
  if (rec.status === "stated") return "You told Raider";
  if (rec.status === "inferred") return "Raider understood";
  if (rec.status === "unknown") return "Still needed / unknown";
  return rec.status;
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

  const nucleus = useMemo(() => isNucleusSatisfied(brief), [brief]);

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
        setLastError(`${result.error}: ${result.message}`);
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
        setLastError(`${result.error}: ${result.message}`);
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

  return (
    <div className={styles.wrap}>
      <div className={styles.meta} aria-live="polite">
        <span>
          Brief version: <strong>{brief.brief_version}</strong>
        </span>
        <span>
          Nucleus:{" "}
          <strong className={nucleus ? styles.ok : styles.warn}>
            {nucleus ? "met" : "not yet"}
          </strong>
        </span>
        <span className={styles.session} title={brief.session_id}>
          Session stub active
        </span>
      </div>

      {lastError ? (
        <p className={styles.error} role="alert">
          {lastError}
        </p>
      ) : null}

      <div className={styles.grid}>
        <section className={styles.form} aria-label="Project Brief form">
          <h2 className={styles.h2}>Your Project Brief</h2>
          <p className={styles.help}>
            Edits go through the Mutation Gateway only. Chat and LLM are not part
            of T0.
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
                </label>
                <p className={styles.status}>{statusLabel(brief, id)}</p>
                <textarea
                  id={`field-${id}`}
                  className={styles.input}
                  rows={id === "current_problem" || id === "customer_actions" ? 3 : 2}
                  value={isUnknown && drafts[id] === undefined ? "" : value}
                  placeholder={
                    isUnknown ? "Marked unknown — type to set a value" : undefined
                  }
                  onChange={(e) => onChangeDraft(id, e.target.value)}
                />
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => commitField(id)}
                  >
                    Save to brief
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
        </section>

        <aside className={styles.panel} aria-label="Live brief state">
          <h2 className={styles.h2}>Live state</h2>
          <p className={styles.help}>
            Single ProjectBrief · version {brief.brief_version}
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
                        ? "○ unknown"
                        : rec.status === "stated"
                          ? `✓ ${Array.isArray(rec.value) ? rec.value.join(", ") : rec.value}`
                          : `● ${Array.isArray(rec.value) ? rec.value.join(", ") : rec.value}`}
                  </span>
                </li>
              );
            })}
          </ul>
          <pre className={styles.debug} tabIndex={0}>
            {JSON.stringify(
              {
                brief_version: brief.brief_version,
                nucleus,
                fields: brief.fields,
              },
              null,
              2,
            )}
          </pre>
        </aside>
      </div>
    </div>
  );
}
