import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          Raider Digital
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/project-intake">Project intake</Link>
        </nav>
      </div>
    </header>
  );
}
