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
  { id: 'golden-diagonal', label: 'Golden Diagonal' },
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
        <select
          className={styles.gridSelect}
          value={activeGrids[0] ?? ''}
          onChange={(e) => {
            const val = e.target.value
            if (val === '') onActiveGridsChange([])
            else selectGrid(val as GridType)
          }}
        >
          <option value="">None</option>
          {GRID_TYPES.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
      </div>

      {(activeGrids.includes('golden-spiral') || activeGrids.includes('golden-diagonal')) && (
        <div className={styles.section}>
          <span className={styles.label}>Rotation</span>
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
