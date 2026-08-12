import Image from "next/image";
import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Raider Digital home">
          <Image
            src="/images/raider/logo-horizontal.png"
            alt="Raider Digital"
            width={200}
            height={56}
            className={styles.logo}
            priority
          />
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/">Home</Link>
          <a href="/#services">Services</a>
          <a href="/#how-it-works">How it works</a>
          <Link href="/project-intake" className={styles.cta}>
            Start a Project
          </Link>
        </nav>
      </div>
    </header>
  );
}
