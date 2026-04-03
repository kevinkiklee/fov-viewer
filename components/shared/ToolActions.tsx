'use client'

import { useState, useCallback } from 'react'
import { ShareModal } from './ShareModal'
import { Toast } from './Toast'
import { copyLinkToClipboard } from '@/lib/utils/export'
import styles from './ToolActions.module.css'

interface ToolActionsProps {
  toolName: string
  toolSlug: string
}

export function ToolActions({ toolName, toolSlug }: ToolActionsProps) {
  const [showShare, setShowShare] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleCopyLink = useCallback(async () => {
    const ok = await copyLinkToClipboard()
    setToast(ok ? 'Link copied!' : 'Failed to copy')
  }, [])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: toolName,
          url: window.location.href,
        })
      } catch {
        // User cancelled — do nothing
      }
      return
    }
    setShowShare(true)
  }, [toolName])

  return (
    <>
      <h2 className={styles.title}>{toolName}</h2>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleCopyLink} aria-label="Copy link">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 9.5a3 3 0 0 0 4.2.3l2-2a3 3 0 0 0-4.2-4.3l-1.1 1.1" />
            <path d="M9.5 6.5a3 3 0 0 0-4.2-.3l-2 2a3 3 0 0 0 4.2 4.3l1.1-1.1" />
          </svg>
          Copy Link
        </button>
        <button className={styles.btn} onClick={handleShare} aria-label="Share">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V8" />
            <polyline points="8 2 8 10" />
            <polyline points="5.5 4.5 8 2 10.5 4.5" />
          </svg>
          Share
        </button>
        <button className={styles.btn} onClick={() => setShowShare(true)} aria-label="Embed">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5 4.5 2 8 5 11.5" />
            <polyline points="11 4.5 14 8 11 11.5" />
            <line x1="9" y1="3" x2="7" y2="13" />
          </svg>
          Embed
        </button>
      </div>

      {showShare && (
        <ShareModal
          toolName={toolName}
          toolSlug={toolSlug}
          onClose={() => setShowShare(false)}
          onToast={setToast}
        />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  )
}
