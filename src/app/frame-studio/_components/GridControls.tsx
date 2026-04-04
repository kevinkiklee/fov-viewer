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
  { id: 'diagonal-lines', label: 'Diagonal Lines' },
  { id: 'center-cross', label: 'Center Cross' },
  { id: 'square-grid', label: 'Square Grid' },
  { id: 'triangles', label: 'Triangles' },
]

const THICKNESS_OPTIONS: GridOptions['thickness'][] = ['thin', 'medium', 'thick']

export function GridControls({
  activeGrids, onActiveGridsChange, options, onOptionsChange,
}: GridControlsProps) {
  const toggleGrid = useCallback((id: GridType) => {
    onActiveGridsChange(
      activeGrids.includes(id)
        ? activeGrids.filter((g) => g !== id)
        : [...activeGrids, id],
    )
  }, [activeGrids, onActiveGridsChange])

  const updateOption = useCallback(<K extends keyof GridOptions>(key: K, value: GridOptions[K]) => {
    onOptionsChange({ ...options, [key]: value })
  }, [options, onOptionsChange])

  return (
    <div className={styles.panel}>
      <span className={styles.heading}>Grid Overlay</span>

      <div className={styles.section}>
        <span className={styles.label}>Type</span>
        <div className={styles.gridTypes}>
          {GRID_TYPES.map((g) => (
            <label key={g.id} className={styles.gridType}>
              <input
                type="checkbox"
                checked={activeGrids.includes(g.id)}
                onChange={() => toggleGrid(g.id)}
              />
              <span>{g.label}</span>
            </label>
          ))}
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
        <input
          type="color"
          value={options.color}
          onChange={(e) => updateOption('color', e.target.value)}
          className={styles.colorPicker}
        />
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Opacity: {Math.round(options.opacity * 100)}%</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(options.opacity * 100)}
          onChange={(e) => updateOption('opacity', parseInt(e.target.value) / 100)}
          className={styles.slider}
        />
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Thickness</span>
        <div className={styles.thicknessBtns}>
          {THICKNESS_OPTIONS.map((t) => (
            <button
              key={t}
              className={`${styles.thicknessBtn} ${options.thickness === t ? styles.active : ''}`}
              onClick={() => updateOption('thickness', t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
