'use client'

import { useTranslations } from 'next-intl'
import { formatDistance } from './dof-helpers'
import s from './DoFCalculator.module.css'

interface ResultsPanelProps {
  nearFocus: number
  farFocus: number
  totalDoF: number
  hyperfocal: number
}

export function DoFResultsPanel({ nearFocus, farFocus, totalDoF, hyperfocal }: ResultsPanelProps) {
  const t = useTranslations('toolUI.dof-calculator')
  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{t('results')}</h3>
      <div className={s.resultsGrid}>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>{t('nearFocus')}</span>
          <span className={s.resultValue}>{formatDistance(nearFocus)}</span>
        </div>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>{t('farFocus')}</span>
          <span className={s.resultValue}>{formatDistance(farFocus)}</span>
        </div>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>{t('totalDoF')}</span>
          <span className={s.resultValue}>{formatDistance(totalDoF)}</span>
        </div>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>{t('hyperfocal')}</span>
          <span className={s.resultValue}>{formatDistance(hyperfocal)}</span>
        </div>
      </div>
    </div>
  )
}
