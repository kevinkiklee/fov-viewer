'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import * as Dialog from '@radix-ui/react-dialog'
import styles from './ShareModal.module.css'

interface ShareModalProps {
  toolName: string
  toolSlug: string
  onClose: () => void
}

export function ShareModal({ toolName, toolSlug, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const baseUrl = 'https://www.phototools.io'
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const toolUrl = `${baseUrl}/${toolSlug}${search}`
  const embedParams = search ? `${search}&embed=1` : '?embed=1'
  const embedUrl = `${baseUrl}/${toolSlug}${embedParams}`
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
      toast('Copied!')
      setTimeout(() => setCopied(null), 2000)
    })
  }, [])

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.modal} aria-describedby={undefined}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>Share &amp; Embed</Dialog.Title>
            <Dialog.Close className={styles.closeBtn} aria-label="Close share modal">&times;</Dialog.Close>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
