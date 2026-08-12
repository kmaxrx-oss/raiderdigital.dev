import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>Raider Digital — systems for service businesses.</p>
        <p className={styles.meta}>Application shell · product law lives in the seo-bot managed site.</p>
      </div>
    </footer>
  );
}
