import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Raider Digital</p>
        <h1 className={styles.title}>
          Websites, workflows, and systems that keep service businesses moving.
        </h1>
        <p className={styles.lead}>
          We design customer-facing sites and the digital machinery behind them —
          intake, payments, staff decisions, and handoffs when the real world does
          not match the order form.
        </p>
        <div className={styles.actions}>
          <Link href="/project-intake" className={styles.primary}>
            Start a project
          </Link>
          <a href="#what-we-do" className={styles.secondary}>
            What we do
          </a>
        </div>
      </section>

      <section id="what-we-do" className={styles.section}>
        <h2>What we build</h2>
        <ul className={styles.list}>
          <li>Customer websites and local discovery surfaces</li>
          <li>Online intake, quotes, and booking flows</li>
          <li>Staff workflows and exception handling</li>
          <li>Integrations and custom software when the off-the-shelf path breaks</li>
        </ul>
        <p className={styles.note}>
          Marketing copy is a shell for launch. Product intake behavior is governed
          by the Forge contract in the seo-bot managed site and implemented under
          OPEN-TRANCHE in this application.
        </p>
      </section>
    </div>
  );
}
