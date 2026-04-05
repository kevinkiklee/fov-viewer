'use client'

import { useCallback } from 'react'
import type { FrameConfig, FramePresetId, FrameFillType, GradientDirection, TexturePreset } from './types'
import { DEFAULT_FRAME_CONFIG, FRAME_PRESETS } from './types'
import styles from './FramePanel.module.css'

interface FramePanelProps {
  config: FrameConfig
  onChange: (config: FrameConfig) => void
}

const PRESET_LIST: { id: FramePresetId; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'white', label: 'White' },
  { id: 'black', label: 'Black' },
  { id: 'custom', label: 'Custom' },
]

const FILL_TYPES: { id: FrameFillType; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'texture', label: 'Texture' },
]

const GRADIENT_DIRS: { id: GradientDirection; label: string }[] = [
  { id: 'top', label: 'Up' },
  { id: 'bottom', label: 'Down' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'diagonal-tl', label: 'Diag TL' },
  { id: 'diagonal-tr', label: 'Diag TR' },
  { id: 'radial', label: 'Radial' },
]

const TEXTURES: { id: TexturePreset; label: string }[] = [
  { id: 'linen', label: 'Linen' },
  { id: 'film-grain', label: 'Film Grain' },
  { id: 'canvas', label: 'Canvas' },
  { id: 'paper', label: 'Paper' },
  { id: 'wood', label: 'Wood' },
  { id: 'marble', label: 'Marble' },
]

export function FramePanel({ config, onChange }: FramePanelProps) {
  const update = useCallback(<K extends keyof FrameConfig>(key: K, value: FrameConfig[K]) => {
    onChange({ ...config, preset: 'custom', [key]: value })
  }, [config, onChange])

  const applyPreset = useCallback((id: FramePresetId) => {
    const preset = FRAME_PRESETS[id]
    onChange({ ...DEFAULT_FRAME_CONFIG, ...preset, preset: id })
  }, [onChange])

  const isCustom = config.preset === 'custom' || config.borderWidth > 0

  return (
    <div className={styles.panel}>
      <span className={styles.heading}>Frame</span>

      <div className={styles.section}>
        <span className={styles.label}>Presets</span>
        <div className={styles.presets}>
          {PRESET_LIST.map((p) => (
            <button
              key={p.id}
              className={`${styles.presetBtn} ${config.preset === p.id ? styles.active : ''}`}
              onClick={() => applyPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isCustom && (
        <>
          <div className={styles.section}>
            <span className={styles.label}>Border Width: {config.borderWidth}px</span>
            <input type="range" min={0} max={400} step={25} list="border-ticks" value={config.borderWidth} onChange={(e) => update('borderWidth', parseInt(e.target.value))} className={styles.slider} />
            <datalist id="border-ticks">
              {Array.from({ length: 17 }, (_, i) => <option key={i} value={i * 25} />)}
            </datalist>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Fill Type</span>
            <div className={styles.fillTypes}>
              {FILL_TYPES.map((f) => (
                <button key={f.id} className={`${styles.fillBtn} ${config.fillType === f.id ? styles.active : ''}`} onClick={() => update('fillType', f.id)}>{f.label}</button>
              ))}
            </div>
          </div>

          {config.fillType === 'solid' && (
            <div className={styles.section}>
              <span className={styles.label}>Color</span>
              <input type="color" value={config.solidColor} onChange={(e) => update('solidColor', e.target.value)} className={styles.colorPicker} />
            </div>
          )}

          {config.fillType === 'gradient' && (
            <>
              <div className={styles.section}>
                <span className={styles.label}>Colors</span>
                <div className={styles.colorRow}>
                  <input type="color" value={config.gradientColor1} onChange={(e) => update('gradientColor1', e.target.value)} className={styles.colorPicker} />
                  <span className={styles.arrow}>→</span>
                  <input type="color" value={config.gradientColor2} onChange={(e) => update('gradientColor2', e.target.value)} className={styles.colorPicker} />
                </div>
              </div>
              <div className={styles.section}>
                <span className={styles.label}>Direction</span>
                <div className={styles.dirBtns}>
                  {GRADIENT_DIRS.map((d) => (
                    <button key={d.id} className={`${styles.dirBtn} ${config.gradientDirection === d.id ? styles.active : ''}`} onClick={() => update('gradientDirection', d.id)}>{d.label}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {config.fillType === 'texture' && (
            <div className={styles.section}>
              <span className={styles.label}>Pattern</span>
              <div className={styles.textures}>
                {TEXTURES.map((t) => (
                  <button key={t.id} className={`${styles.textureBtn} ${config.texture === t.id ? styles.active : ''}`} onClick={() => update('texture', t.id)}>{t.label}</button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <span className={styles.label}>Corner Radius: {config.cornerRadius}px</span>
            <input type="range" min={0} max={60} value={config.cornerRadius} onChange={(e) => update('cornerRadius', parseInt(e.target.value))} className={styles.slider} />
          </div>
        </>
      )}
    </div>
  )
}
