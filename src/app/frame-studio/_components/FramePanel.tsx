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
  { id: 'clean-white', label: 'Clean White' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'film', label: 'Film' },
  { id: 'polaroid', label: 'Polaroid' },
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
            <input type="range" min={0} max={200} value={config.borderWidth} onChange={(e) => update('borderWidth', parseInt(e.target.value))} className={styles.slider} />
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

          <div className={styles.section}>
            <label className={styles.toggle}>
              <input type="checkbox" checked={config.innerMatEnabled} onChange={(e) => update('innerMatEnabled', e.target.checked)} />
              <span>Inner Mat</span>
            </label>
            {config.innerMatEnabled && (
              <div className={styles.subControls}>
                <div className={styles.subRow}>
                  <span className={styles.subLabel}>Width: {config.innerMatWidth}px</span>
                  <input type="range" min={1} max={30} value={config.innerMatWidth} onChange={(e) => update('innerMatWidth', parseInt(e.target.value))} className={styles.slider} />
                </div>
                <div className={styles.subRow}>
                  <span className={styles.subLabel}>Color</span>
                  <input type="color" value={config.innerMatColor} onChange={(e) => update('innerMatColor', e.target.value)} className={styles.colorPicker} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <label className={styles.toggle}>
              <input type="checkbox" checked={config.shadowEnabled} onChange={(e) => update('shadowEnabled', e.target.checked)} />
              <span>Shadow</span>
            </label>
            {config.shadowEnabled && (
              <div className={styles.subControls}>
                <div className={styles.subRow}>
                  <span className={styles.subLabel}>Color</span>
                  <input type="color" value={config.shadowColor} onChange={(e) => update('shadowColor', e.target.value)} className={styles.colorPicker} />
                </div>
                <div className={styles.subRow}>
                  <span className={styles.subLabel}>Blur: {config.shadowBlur}px</span>
                  <input type="range" min={0} max={60} value={config.shadowBlur} onChange={(e) => update('shadowBlur', parseInt(e.target.value))} className={styles.slider} />
                </div>
                <div className={styles.subRow}>
                  <span className={styles.subLabel}>Offset Y: {config.shadowOffsetY}px</span>
                  <input type="range" min={-20} max={20} value={config.shadowOffsetY} onChange={(e) => update('shadowOffsetY', parseInt(e.target.value))} className={styles.slider} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
