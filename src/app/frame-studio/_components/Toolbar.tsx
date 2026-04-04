'use client'

import type { EditorMode } from './types'
import styles from './Toolbar.module.css'

interface ToolbarProps {
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
  hasImage: boolean
  gridOpen: boolean
  onGridToggle: () => void
  onExport: () => void
  onReset: () => void
}

const MODES: { id: EditorMode; label: string }[] = [
  { id: 'view', label: 'View' },
  { id: 'crop', label: 'Crop' },
  { id: 'frame', label: 'Frame' },
]

export function Toolbar({
  mode, onModeChange, hasImage, gridOpen, onGridToggle, onExport, onReset,
}: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.modes}>
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`${styles.modeBtn} ${mode === m.id ? styles.active : ''}`}
            onClick={() => onModeChange(m.id)}
            disabled={!hasImage}
            aria-pressed={mode === m.id}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.iconBtn} ${gridOpen ? styles.active : ''}`}
          onClick={onGridToggle}
          disabled={!hasImage}
          aria-label="Toggle grid overlay"
          title="Grid overlay"
        >
          <svg viewBox="0 0 20 20" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="2" y="2" width="16" height="16" rx="1" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="13" y1="2" x2="13" y2="18" />
            <line x1="2" y1="8" x2="18" y2="8" />
            <line x1="2" y1="13" x2="18" y2="13" />
          </svg>
        </button>
        <button
          className={styles.exportBtn}
          onClick={onExport}
          disabled={!hasImage}
        >
          Export
        </button>
        <button
          className={styles.iconBtn}
          onClick={onReset}
          disabled={!hasImage}
          aria-label="Reset"
          title="Reset all edits"
        >
          <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 8a5.5 5.5 0 1 1 1.3 3.5" />
            <polyline points="2 11.5 2.5 8.5 5.5 9" />
          </svg>
        </button>
      </div>
    </div>
  )
}
