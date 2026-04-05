'use client'

import { useTranslations } from 'next-intl'
import styles from './FovSimulator.module.css'

interface ActionBarProps {
  onCopyImage: () => void
  onCopyLink: () => void
  onReset: () => void
  onShare: () => void
}

export function ActionBar({ onCopyImage, onCopyLink, onReset, onShare }: ActionBarProps) {
  const t = useTranslations('toolUI.fov-simulator')
  return (
    <div className={styles.actionBar}>
      <button className={`${styles.actionBarBtn} ${styles.actionBarBtnPrimary}`} onClick={onCopyImage}>
        {t('copyImage')}
      </button>
      <button className={styles.actionBarBtn} onClick={onCopyLink}>
        {t('copyLink')}
      </button>
      <button className={styles.actionBarBtn} onClick={onShare}>
        {t('embed')}
      </button>
      <button className={styles.actionBarBtn} onClick={onReset}>
        {t('reset')}
      </button>
    </div>
  )
}
