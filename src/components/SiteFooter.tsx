import Image from "next/image";
import Link from "next/link";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Image
            src="/images/raider/logo-horizontal.png"
            alt="Raider Digital"
            width={180}
            height={50}
            className={styles.logo}
          />
          <p className={styles.tag}>
            Websites, local SEO, and workflows for service businesses.
          </p>
        </div>
        <div className={styles.cols}>
          <div>
            <h2 className={styles.colTitle}>Services</h2>
            <ul>
              <li>
                <a href="/#services">Web Development</a>
              </li>
              <li>
                <a href="/#services">SEO</a>
              </li>
              <li>
                <a href="/#services">UX/UI &amp; Workflows</a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className={styles.colTitle}>Start</h2>
            <ul>
              <li>
                <Link href="/project-intake">Project intake</Link>
              </li>
              <li>
                <a href="/#how-it-works">How it works</a>
              </li>
              <li>
                <a href="/#faq">FAQ</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Raider Digital. All rights reserved.</p>
      </div>
    </footer>
  );
}
