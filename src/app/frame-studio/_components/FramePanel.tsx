'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import type { FrameConfig, FramePresetId } from './types'
import {
  DEFAULT_FRAME_CONFIG, FRAME_PRESETS, PRESET_LIST, FILL_TYPES, GRADIENT_DIRS, TEXTURES,
} from '@/lib/data/frameStudio'
import styles from './FramePanel.module.css'

interface FramePanelProps {
  config: FrameConfig
  onChange: (config: FrameConfig) => void
}

export function FramePanel({ config, onChange }: FramePanelProps) {
  const t = useTranslations('toolUI.frame-studio')
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
      <span className={styles.heading}>{t('frame')}</span>

      <div className={styles.section}>
        <span className={styles.label}>{t('presets')}</span>
        <div className={styles.presets}>
          {PRESET_LIST.map((p) => (
            <button
              key={p.id}
              className={`${styles.presetBtn} ${config.preset === p.id ? styles.active : ''}`}
              onClick={() => applyPreset(p.id)}
            >
              {t(p.key)}
            </button>
          ))}
        </div>
      </div>

      {isCustom && (
        <>
          <div className={styles.section}>
            <span className={styles.label}>{t('borderWidth')} {config.borderWidth}px</span>
            <input type="range" min={0} max={400} step={25} list="border-ticks" value={config.borderWidth} onChange={(e) => update('borderWidth', parseInt(e.target.value))} className={styles.slider} />
            <datalist id="border-ticks">
              {Array.from({ length: 17 }, (_, i) => <option key={i} value={i * 25} />)}
            </datalist>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>{t('fillType')}</span>
            <div className={styles.fillTypes}>
              {FILL_TYPES.map((f) => (
                <button key={f.id} className={`${styles.fillBtn} ${config.fillType === f.id ? styles.active : ''}`} onClick={() => update('fillType', f.id)}>{t(f.key)}</button>
              ))}
            </div>
          </div>

          {config.fillType === 'solid' && (
            <div className={styles.section}>
              <span className={styles.label}>{t('color')}</span>
              <input type="color" value={config.solidColor} onChange={(e) => update('solidColor', e.target.value)} className={styles.colorPicker} />
            </div>
          )}

          {config.fillType === 'gradient' && (
            <>
              <div className={styles.section}>
                <span className={styles.label}>{t('colors')}</span>
                <div className={styles.colorRow}>
                  <input type="color" value={config.gradientColor1} onChange={(e) => update('gradientColor1', e.target.value)} className={styles.colorPicker} />
                  <span className={styles.arrow}>→</span>
                  <input type="color" value={config.gradientColor2} onChange={(e) => update('gradientColor2', e.target.value)} className={styles.colorPicker} />
                </div>
              </div>
              <div className={styles.section}>
                <span className={styles.label}>{t('direction')}</span>
                <div className={styles.dirBtns}>
                  {GRADIENT_DIRS.map((d) => (
                    <button key={d.id} className={`${styles.dirBtn} ${config.gradientDirection === d.id ? styles.active : ''}`} onClick={() => update('gradientDirection', d.id)}>{t(d.key)}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {config.fillType === 'texture' && (
            <div className={styles.section}>
              <span className={styles.label}>{t('pattern')}</span>
              <div className={styles.textures}>
                {TEXTURES.map((tex) => (
                  <button key={tex.id} className={`${styles.textureBtn} ${config.texture === tex.id ? styles.active : ''}`} onClick={() => update('texture', tex.id)}>{t(tex.key)}</button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <span className={styles.label}>{t('cornerRadius')} {config.cornerRadius}px</span>
            <input type="range" min={0} max={60} value={config.cornerRadius} onChange={(e) => update('cornerRadius', parseInt(e.target.value))} className={styles.slider} />
          </div>
        </>
      )}
    </div>
  )
}
