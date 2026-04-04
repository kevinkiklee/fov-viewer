'use client'

import styles from './FovSimulator.module.css'

interface ActionBarProps {
  onCopyImage: () => void
  onCopyLink: () => void
  onReset: () => void
  onShare: () => void
}

export function ActionBar({ onCopyImage, onCopyLink, onReset, onShare }: ActionBarProps) {
  return (
    <div className={styles.actionBar}>
      <button className={`${styles.actionBarBtn} ${styles.actionBarBtnPrimary}`} onClick={onCopyImage}>
        Copy image
      </button>
      <button className={styles.actionBarBtn} onClick={onCopyLink}>
        Copy link
      </button>
      <button className={styles.actionBarBtn} onClick={onShare}>
        Embed
      </button>
      <button className={styles.actionBarBtn} onClick={onReset}>
        Reset
      </button>
    </div>
  )
}
