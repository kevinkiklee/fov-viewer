'use client'

import { useTranslations } from 'next-intl'

export function DraftBanner() {
  const t = useTranslations('common.draft')

  return (
    <div style={{
      background: '#f59e0b',
      color: '#000',
      textAlign: 'center',
      padding: '4px 8px',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
    }}>
      {t('banner')}
    </div>
  )
}
