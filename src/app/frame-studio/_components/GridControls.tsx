'use client'

import { useCallback } from 'react'
import type { GridType, GridOptions } from './types'
import styles from './GridControls.module.css'

interface GridControlsProps {
  activeGrids: GridType[]
  onActiveGridsChange: (grids: GridType[]) => void
  options: GridOptions
  onOptionsChange: (options: GridOptions) => void
}

const GRID_TYPES: { id: GridType; label: string }[] = [
  { id: 'rule-of-thirds', label: 'Rule of Thirds' },
  { id: 'golden-ratio', label: 'Golden Ratio' },
  { id: 'golden-spiral', label: 'Golden Spiral' },
  { id: 'diagonal-lines', label: 'Diagonal' },
  { id: 'center-cross', label: 'Center Cross' },
  { id: 'square-grid', label: 'Square Grid' },
  { id: 'triangles', label: 'Triangles' },
]

const PALETTE_COLORS = [
  '#ffffff', // White
  '#00ffff', // Cyan (Default)
  '#00ff00', // Green
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#ff0000', // Red
  '#000000', // Black
]

export function GridControls({
  activeGrids, onActiveGridsChange, options, onOptionsChange,
}: GridControlsProps) {
  const selectGrid = useCallback((id: GridType) => {
    // Only 1 selectable at a time as requested
    onActiveGridsChange([id])
  }, [onActiveGridsChange])

  const updateOption = useCallback(<K extends keyof GridOptions>(key: K, value: GridOptions[K]) => {
    onOptionsChange({ ...options, [key]: value })
  }, [options, onOptionsChange])

  return (
    <div className={styles.panel}>
      <span className={styles.heading}>Grid Overlay</span>

      <div className={styles.section}>
        <span className={styles.label}>Type</span>
        <div className={styles.gridTypes}>
          <label className={styles.gridBtn}>
            <input
              type="radio"
              name="grid-type"
              checked={activeGrids.length === 0}
              onChange={() => onActiveGridsChange([])}
            />
            <span
              className={styles.gridDot}
              style={{
                backgroundColor: 'transparent',
                border: '1.5px solid var(--text-secondary)',
                opacity: activeGrids.length === 0 ? 1 : 0.4
              }}
            />
            <span className={styles.gridName}>None</span>
            <span className={styles.gridOutline} />
          </label>
          {GRID_TYPES.map((g) => {
            const isChecked = activeGrids.includes(g.id)
            return (
              <label key={g.id} className={styles.gridBtn}>
                <input
                  type="radio"
                  name="grid-type"
                  checked={isChecked}
                  onChange={() => selectGrid(g.id)}
                />
                <span
                  className={styles.gridDot}
                  style={{ backgroundColor: options.color, opacity: isChecked ? options.opacity : 0.2 }}
                />
                <span className={styles.gridName}>{g.label}</span>
                <span className={styles.gridOutline} />
              </label>
            )
          })}
        </div>
      </div>

      {activeGrids.includes('golden-spiral') && (
        <div className={styles.section}>
          <span className={styles.label}>Spiral Rotation</span>
          <div className={styles.rotationBtns}>
            {([0, 90, 180, 270] as const).map((r) => (
              <button
                key={r}
                className={`${styles.rotBtn} ${options.spiralRotation === r ? styles.active : ''}`}
                onClick={() => updateOption('spiralRotation', r)}
              >
                {r}&deg;
              </button>
            ))}
          </div>
        </div>
      )}

      {activeGrids.includes('square-grid') && (
        <div className={styles.section}>
          <span className={styles.label}>Grid Density: {options.gridDensity}x{options.gridDensity}</span>
          <input
            type="range"
            min={2}
            max={12}
            value={options.gridDensity}
            onChange={(e) => updateOption('gridDensity', parseInt(e.target.value))}
            className={styles.slider}
          />
        </div>
      )}

      <div className={styles.section}>
        <span className={styles.label}>Line Color</span>
        <div className={styles.colorPalette}>
          {PALETTE_COLORS.map((c) => (
            <button
              key={c}
              className={`${styles.paletteBtn} ${options.color === c ? styles.active : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => updateOption('color', c)}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
