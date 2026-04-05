'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { LensConfig } from '@/lib/types'
import { getSensor } from '@/lib/data/sensors'
import { stateToQueryString } from './querySync'
import type { FovSimulatorState } from './types'
import styles from './FovSimulator.module.css'

interface ShareModalProps {
  state: FovSimulatorState
  onClose: () => void
}

function buildLabel(lenses: LensConfig[]): string {
  const parts = lenses.map((l) => {
    const sensor = getSensor(l.sensorId)
    return `${l.focalLength}mm ${sensor.name}`
  })
  return parts.join(' vs ')
}

export function ShareModal({ state, onClose }: ShareModalProps) {
  const t = useTranslations('toolUI.fov-simulator')
  const [copied, setCopied] = useState<string | null>(null)
  const qs = stateToQueryString(state)
  const baseUrl = 'https://www.phototools.io/fov-simulator'
  const toolUrl = `${baseUrl}?${qs}`
  const embedUrl = `${baseUrl}?${qs}&embed=1`
  const labelParts = buildLabel(state.lenses)
  const label = `${labelParts} ${t('fovComparison')}`

  const snippets = {
    link: toolUrl,
    markdown: `[${label}](${toolUrl})`,
    bbcode: `[url=${toolUrl}]${label}[/url]`,
    iframe: `<iframe src="${embedUrl}" width="800" height="600" style="border:none;" title="${label}"></iframe>`,
  }

  const copy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      toast('Copied!')
      setTimeout(() => setCopied(null), 2000)
    })
  }, [])

  return (
    <div className={styles.shareModalOverlay} onClick={onClose} role="dialog" aria-label={t('embedTitle')}>
      <div className={styles.shareModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.shareModalHeader}>
          <h3>{t('embedTitle')}</h3>
          <button className={styles.shareModalClose} onClick={onClose} aria-label={t('closeEmbedModal')}>&times;</button>
        </div>

        <div className={styles.shareModalSection}>
          <label>{t('markdownLabel')}</label>
          <div className={styles.shareModalRow}>
            <input type="text" readOnly value={snippets.markdown} />
            <button onClick={() => copy('markdown', snippets.markdown)}>
              {copied === 'markdown' ? t('copied') : t('copy')}
            </button>
          </div>
        </div>

        <div className={styles.shareModalSection}>
          <label>{t('bbcodeLabel')}</label>
          <div className={styles.shareModalRow}>
            <input type="text" readOnly value={snippets.bbcode} />
            <button onClick={() => copy('bbcode', snippets.bbcode)}>
              {copied === 'bbcode' ? t('copied') : t('copy')}
            </button>
          </div>
        </div>

        <div className={styles.shareModalSection}>
          <label>{t('htmlEmbedLabel')}</label>
          <div className={styles.shareModalRow}>
            <input type="text" readOnly value={snippets.iframe} />
            <button onClick={() => copy('iframe', snippets.iframe)}>
              {copied === 'iframe' ? t('copied') : t('copy')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
