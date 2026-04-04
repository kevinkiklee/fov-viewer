import Link from 'next/link'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.infoRow}>
        <Link href="/learn/glossary" className={styles.link}>Glossary</Link>
        <Link href="/contact" className={styles.link}>Contact</Link>
        <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
        <Link href="/terms" className={styles.link}>Terms of Service</Link>
        <span className={styles.separator} />
        <p>&copy; {new Date().getFullYear()} PhotoTools</p>
      </div>
    </footer>
  )
}
