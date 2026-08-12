import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <h1>Page not found</h1>
      <p>That route is not part of this site shell.</p>
      <Link href="/">Back home</Link>
    </div>
  );
}
