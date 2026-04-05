'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import type { GridType, GridOptions } from './types'
import { GRID_TYPES, PALETTE_COLORS } from '@/lib/data/frameStudio'
import styles from './GridControls.module.css'

interface GridControlsProps {
  activeGrids: GridType[]
  onActiveGridsChange: (grids: GridType[]) => void
  options: GridOptions
  onOptionsChange: (options: GridOptions) => void
  onResetGrid: () => void
}

export function GridControls({
  activeGrids, onActiveGridsChange, options, onOptionsChange, onResetGrid,
}: GridControlsProps) {
  const t = useTranslations('toolUI.frame-studio')
  const selectGrid = useCallback((id: GridType) => {
    onActiveGridsChange([id])
  }, [onActiveGridsChange])

  const updateOption = useCallback(<K extends keyof GridOptions>(key: K, value: GridOptions[K]) => {
    onOptionsChange({ ...options, [key]: value })
  }, [options, onOptionsChange])

  return (
    <div className={styles.panel}>
      <span className={styles.heading}>{t('gridOverlay')}</span>

      <div className={styles.section}>
        <span className={styles.label}>{t('gridType')}</span>
        <select
          className={styles.gridSelect}
          value={activeGrids[0] ?? ''}
          onChange={(e) => {
            const val = e.target.value
            if (val === '') onActiveGridsChange([])
            else selectGrid(val as GridType)
          }}
        >
          <option value="">{t('gridNone')}</option>
          {GRID_TYPES.map((g) => (
            <option key={g.id} value={g.id}>{t(g.key)}</option>
          ))}
        </select>
      </div>

      {(activeGrids.includes('golden-spiral') || activeGrids.includes('golden-diagonal')) && (
        <div className={`${styles.section} ${styles.conditionalSection}`}>
          <span className={styles.label}>{t('rotation')}</span>
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
        <div className={`${styles.section} ${styles.conditionalSection}`}>
          <span className={styles.label}>{t('gridDensity')} {options.gridDensity}x{options.gridDensity}</span>
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
        <span className={styles.label}>{t('lineColor')}</span>
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

      {activeGrids.length > 0 && (
        <button className={styles.resetBtn} onClick={onResetGrid}>{t('resetGrid')}</button>
      )}
    </div>
  )
}
