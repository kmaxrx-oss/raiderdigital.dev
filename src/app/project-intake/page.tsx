import type { Metadata } from "next";
import { ProjectBriefForm } from "@/components/intake/ProjectBriefForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Project intake",
  description:
    "Tell Raider what you need in a Project Brief, review it, and send one clear project request.",
};

export default function ProjectIntakePage() {
  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Project intake</p>
      <h1 className={styles.title}>Start a project with Raider</h1>
      <p className={styles.lead}>
        Describe what you need in plain language, save it into one Project Brief,
        review the facts you entered, and send a single request. No package
        picker required to begin.
      </p>
      <ProjectBriefForm />
    </div>
  );
}
