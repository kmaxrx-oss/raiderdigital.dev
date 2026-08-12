import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Project intake",
  description:
    "Tell Raider what you need — one Project Brief, chat or form. Product behavior ships under OPEN-TRANCHE.",
};

/**
 * Shell only. T0+ binds ProjectBrief / Mutation Gateway / form projection
 * from Forge v1.1 into this route — not into the seo-bot docs workspace.
 */
export default function ProjectIntakePage() {
  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Project intake</p>
      <h1 className={styles.title}>Tell Raider → Live Project Brief</h1>
      <p className={styles.lead}>
        This route is the future home of dual-mode intake: conversation and direct
        form over one canonical Project Brief, with Graceful Finish when you are
        ready to send what you know.
      </p>
      <div className={styles.panel} role="status">
        <h2 className={styles.panelTitle}>Application shell ready</h2>
        <p>
          Product behavior is not implemented on this page yet. T0 will add the
          ProjectBrief model, Mutation Gateway, and form projection in this
          repository under an OPEN-TRANCHE — not inside the seo-bot managed-site
          documentation tree.
        </p>
        <ul className={styles.checklist}>
          <li>Route: <code>/project-intake</code></li>
          <li>Stack: Next.js App Router (host API + UI in one root)</li>
          <li>Authority: Forge v1.1 in seo-bot managed-sites</li>
        </ul>
      </div>
    </div>
  );
}
