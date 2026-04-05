'use client'

import { useTranslations } from 'next-intl'
import { formatShutterSpeed } from '@/lib/math/exposure'
import { getToolBySlug } from '@/lib/data/tools'
import { SHUTTER_PRESETS } from './shutter-data'
import calc from '@/components/shared/Calculator.module.css'
import ss from './ShutterSpeedGuide.module.css'

const tool = getToolBySlug('shutter-speed-visualizer')!

export function ShutterControlsPanel({ shutterIdx, onShutterChange }: {
  shutterIdx: number
  onShutterChange: (idx: number) => void
}) {
  const t = useTranslations('toolUI.shutter-speed-visualizer')
  const preset = SHUTTER_PRESETS[shutterIdx]
  return (
    <>
      <div className={ss.header}>
        <h1 className={ss.title}>{tool.name}</h1>
        <p className={ss.description}>{t('description')}</p>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>{t('shutterSpeed')}</label>
        <div className={ss.shutterValue}>{preset.label}</div>
        <input
          type="range"
          className={ss.slider}
          min={0}
          max={SHUTTER_PRESETS.length - 1}
          value={shutterIdx}
          onChange={(e) => onShutterChange(Number(e.target.value))}
          aria-label={t('shutterSpeedAriaLabel')}
          aria-valuetext={preset.label}
        />
        <div className={ss.sliderLabels}>
          <span>{t('sliderSlow')}</span>
          <span>{t('sliderFast')}</span>
        </div>
      </div>

      <div className={ss.presets}>
        {SHUTTER_PRESETS.map((p, i) => (
          <button
            key={p.label}
            className={`${ss.preset} ${shutterIdx === i ? ss.presetActive : ''}`}
            onClick={() => onShutterChange(i)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={ss.resultCard}>
        <span className={ss.resultCaption}>{t('selectedSpeed')}</span>
        <span className={ss.resultBig}>{formatShutterSpeed(preset.value)}</span>
      </div>
    </>
  )
}
