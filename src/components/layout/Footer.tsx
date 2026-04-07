'use client'

import { Link } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { trackNavClick } from '@/lib/analytics'
import styles from './Footer.module.css'

export function Footer() {
  const t = useTranslations('common.footer')

  return (
    <footer className={styles.footer}>
      <div className={styles.infoRow}>
        <Link href="/learn/glossary" className={styles.link} data-ph-capture-attribute-source="footer" onClick={() => trackNavClick({ target: 'glossary', source: 'footer' })}>{t('glossary')}</Link>
        <Link href="/about" className={styles.link} data-ph-capture-attribute-source="footer" onClick={() => trackNavClick({ target: 'about', source: 'footer' })}>{t('about')}</Link>
        <Link href="/contact" className={styles.link} data-ph-capture-attribute-source="footer" onClick={() => trackNavClick({ target: 'contact', source: 'footer' })}>{t('contact')}</Link>
        <Link href="/privacy" className={styles.link} data-ph-capture-attribute-source="footer" onClick={() => trackNavClick({ target: 'privacy', source: 'footer' })}>{t('privacy')}</Link>
        <Link href="/terms" className={styles.link} data-ph-capture-attribute-source="footer" onClick={() => trackNavClick({ target: 'terms', source: 'footer' })}>{t('terms')}</Link>
        <button type="button" className={`cky-banner-element ${styles.cookieButton}`}>{t('cookieSettings')}</button>
        <span className={styles.separator} />
        <p>&copy; {new Date().getFullYear()} PhotoTools</p>
      </div>
    </footer>
  )
}
