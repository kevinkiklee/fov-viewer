'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import styles from './Footer.module.css'

export function Footer() {
  const t = useTranslations('common.footer')

  return (
    <footer className={styles.footer}>
      <div className={styles.infoRow}>
        <Link href="/learn/glossary" className={styles.link}>{t('glossary')}</Link>
        <Link href="/about" className={styles.link}>{t('about')}</Link>
        <Link href="/contact" className={styles.link}>{t('contact')}</Link>
        <Link href="/privacy" className={styles.link}>{t('privacy')}</Link>
        <Link href="/terms" className={styles.link}>{t('terms')}</Link>
        <button type="button" className={`cky-banner-element ${styles.cookieButton}`}>{t('cookieSettings')}</button>
        <span className={styles.separator} />
        <p>&copy; {new Date().getFullYear()} PhotoTools</p>
      </div>
    </footer>
  )
}
