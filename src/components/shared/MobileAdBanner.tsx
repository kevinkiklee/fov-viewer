// Sticky bottom ad banner shown only on mobile viewports.
// Slides up after a 3s delay to avoid layout shift on initial load.
// Dismissible via close button — persisted in sessionStorage so it
// stays hidden for the rest of the browser session but returns on next visit.

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { isAdsEnabled } from '@/lib/ads'
import { AdUnit } from './AdUnit'
import styles from './MobileAdBanner.module.css'

const DISMISS_KEY = 'phototools-ad-dismissed'

export function MobileAdBanner() {
  const t = useTranslations('common.ad')
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isAdsEnabled()) return
    if (sessionStorage.getItem(DISMISS_KEY) === '1') {
      setDismissed(true)
      return
    }
    const timer = setTimeout(() => setVisible(true), 3000) // delay to avoid CLS
    return () => clearTimeout(timer)
  }, [])

  if (!isAdsEnabled() || dismissed) return null

  function handleClose() {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className={`${styles.banner} ${!visible ? styles.hidden : ''}`}>
      <button
        className={styles.closeBtn}
        onClick={handleClose}
        aria-label={t('closeAd')}
      >
        &times;
      </button>
      <AdUnit slot="" format="mobile-banner" channel="mobile_banner" />
    </div>
  )
}
