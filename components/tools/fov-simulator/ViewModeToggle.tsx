'use client'

import type { ViewMode } from './types'
import styles from './ViewModeToggle.module.css'

const OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'fov', label: 'FOV' },
  { value: 'compression', label: 'Compression' },
]

interface ViewModeToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className={styles.toggle} role="radiogroup" aria-label="View mode">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          role="radio"
          aria-checked={value === opt.value}
          className={`${styles.option}${value === opt.value ? ` ${styles.optionActive}` : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
