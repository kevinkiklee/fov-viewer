'use client'

import { useState, useCallback } from 'react'
import styles from './ShareModal.module.css'

interface ShareModalProps {
  toolName: string
  toolSlug: string
  onClose: () => void
  onToast: (msg: string) => void
}

export function ShareModal({ toolName, toolSlug, onClose, onToast }: ShareModalProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const baseUrl = 'https://www.phototools.io'
  const toolUrl = `${baseUrl}/tools/${toolSlug}`
  const embedUrl = `${toolUrl}?embed=1`
  const label = toolName

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
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-label="Share and Embed">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Share &amp; Embed</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close share modal">&times;</button>
        </div>

        <div className={styles.section}>
          <label>Direct Link</label>
          <div className={styles.row}>
            <input type="text" readOnly value={snippets.link} />
            <button onClick={() => copy('link', snippets.link)}>
              {copied === 'link' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label>Markdown (Reddit, GitHub)</label>
          <div className={styles.row}>
            <input type="text" readOnly value={snippets.markdown} />
            <button onClick={() => copy('markdown', snippets.markdown)}>
              {copied === 'markdown' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label>BBCode (Forums)</label>
          <div className={styles.row}>
            <input type="text" readOnly value={snippets.bbcode} />
            <button onClick={() => copy('bbcode', snippets.bbcode)}>
              {copied === 'bbcode' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <label>HTML Embed</label>
          <div className={styles.row}>
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
