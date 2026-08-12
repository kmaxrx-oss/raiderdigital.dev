import type { Metadata } from "next";
import { ProjectBriefForm } from "@/components/intake/ProjectBriefForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Project intake",
  description:
    "Tell Raider what you need — one Project Brief via form (T0). Chat and LLM come later.",
};

export default function ProjectIntakePage() {
  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Project intake · T0</p>
      <h1 className={styles.title}>Your Project Brief</h1>
      <p className={styles.lead}>
        Form projection over one canonical brief. Saves go through the Mutation
        Gateway with version checks. Chat, LLM extraction, Graceful Finish, and
        durable submit are not in this tranche.
      </p>
      <ProjectBriefForm />
    </div>
  );
}
