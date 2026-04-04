'use client'

import { useState, useCallback } from 'react'
import { ASPECT_RATIOS, type AspectRatioPreset } from './types'
import styles from './CropPanel.module.css'

interface CropPanelProps {
  selectedRatio: number | null
  onRatioChange: (ratio: number | null) => void
  onApply: () => void
}

export function CropPanel({ selectedRatio, onRatioChange, onApply }: CropPanelProps) {
  const [flipped, setFlipped] = useState(false)
  const [customW, setCustomW] = useState('')
  const [customH, setCustomH] = useState('')

  const handlePreset = useCallback((preset: AspectRatioPreset) => {
    if (preset.value === null) {
      onRatioChange(null)
      return
    }
    const ratio = flipped ? preset.h / preset.w : preset.w / preset.h
    onRatioChange(ratio)
  }, [onRatioChange, flipped])

  const handleFlip = useCallback(() => {
    setFlipped((f) => {
      const next = !f
      if (selectedRatio !== null && selectedRatio !== 1) {
        onRatioChange(1 / selectedRatio)
      }
      return next
    })
  }, [selectedRatio, onRatioChange])

  const handleCustomApply = useCallback(() => {
    const w = parseFloat(customW)
    const h = parseFloat(customH)
    if (w > 0 && h > 0) {
      onRatioChange(w / h)
    }
  }, [customW, customH, onRatioChange])

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <span className={styles.label}>Aspect Ratio</span>
        <div className={styles.ratios}>
          {ASPECT_RATIOS.map((r) => {
            const ratio = r.value === null
              ? null
              : flipped && r.value !== 1 ? r.h / r.w : r.w / r.h
            const isActive = selectedRatio === ratio
            return (
              <button
                key={r.label}
                className={`${styles.ratioBtn} ${isActive ? styles.active : ''}`}
                onClick={() => handlePreset(r)}
              >
                {r.label}
              </button>
            )
          })}
        </div>
        <button className={styles.flipBtn} onClick={handleFlip} title="Flip orientation">
          <svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M4 2v12M12 2v12M1 8h14" />
          </svg>
          {flipped ? 'Portrait' : 'Landscape'}
        </button>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Custom Ratio</span>
        <div className={styles.customRow}>
          <input
            type="number"
            className={styles.input}
            placeholder="W"
            value={customW}
            onChange={(e) => setCustomW(e.target.value)}
            min={1}
          />
          <span className={styles.separator}>:</span>
          <input
            type="number"
            className={styles.input}
            placeholder="H"
            value={customH}
            onChange={(e) => setCustomH(e.target.value)}
            min={1}
          />
          <button className={styles.applyBtn} onClick={handleCustomApply}>Set</button>
        </div>
      </div>

      <button className={styles.doneBtn} onClick={onApply}>
        Apply Crop
      </button>
    </div>
  )
}
