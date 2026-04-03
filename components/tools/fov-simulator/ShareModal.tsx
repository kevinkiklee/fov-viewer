'use client'

import { useState, useCallback } from 'react'
import type { LensConfig } from '@/lib/types'
import { getSensor } from '@/lib/data/sensors'
import { stateToQueryString } from './querySync'
import type { FovSimulatorState } from './types'
import styles from './FovSimulator.module.css'

interface ShareModalProps {
  state: FovSimulatorState
  onClose: () => void
  onToast: (msg: string) => void
}

function buildLabel(lenses: LensConfig[]): string {
  const parts = lenses.map((l) => {
    const sensor = getSensor(l.sensorId)
    return `${l.focalLength}mm ${sensor.name}`
  })
  return parts.join(' vs ') + ' FOV Comparison'
}

export function ShareModal({ state, onClose, onToast }: ShareModalProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const qs = stateToQueryString(state)
  const baseUrl = 'https://www.phototools.io/'
  const toolUrl = `${baseUrl}?${qs}`
  const embedUrl = `${baseUrl}?${qs}&embed=1`
  const label = buildLabel(state.lenses)

  const snippets = {
    link: toolUrl,
    markdown: `[${label}](${toolUrl})`,
    bbcode: `[url=${toolUrl}]${label}[/url]`,
    iframe: `<iframe src="${embedUrl}" width="800" height="600" style="border:none;" title="${label}"></iframe>`,
  }

  const copy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      onToast('Copied!')
      setTimeout(() => setCopied(null), 2000)
    })
  }, [onToast])

  return (
    <div className={styles.shareModalOverlay} onClick={onClose} role="dialog" aria-label="Embed">
      <div className={styles.shareModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.shareModalHeader}>
          <h3>Embed</h3>
          <button className={styles.shareModalClose} onClick={onClose} aria-label="Close embed modal">&times;</button>
        </div>

        <div className={styles.shareModalSection}>
          <label>Markdown (Reddit, GitHub)</label>
          <div className={styles.shareModalRow}>
            <input type="text" readOnly value={snippets.markdown} />
            <button onClick={() => copy('markdown', snippets.markdown)}>
              {copied === 'markdown' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className={styles.shareModalSection}>
          <label>BBCode (Forums)</label>
          <div className={styles.shareModalRow}>
            <input type="text" readOnly value={snippets.bbcode} />
            <button onClick={() => copy('bbcode', snippets.bbcode)}>
              {copied === 'bbcode' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className={styles.shareModalSection}>
          <label>HTML Embed</label>
          <div className={styles.shareModalRow}>
            <input type="text" readOnly value={snippets.iframe} />
            <button onClick={() => copy('iframe', snippets.iframe)}>
              {copied === 'iframe' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
