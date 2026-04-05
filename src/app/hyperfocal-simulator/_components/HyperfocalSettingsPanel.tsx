'use client'

import { useTranslations } from 'next-intl'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import { APERTURES } from '@/lib/data/camera'
import s from './HyperfocalSimulator.module.css'

function formatDistance(meters: number): string {
  if (!isFinite(meters)) return '∞'
  if (meters < 1) return `${(meters * 100).toFixed(0)} cm`
  return `${meters.toFixed(2)} m`
}

export function HyperfocalSettingsPanel({
  focalLength, aperture, sliderVal, sensorId, distance,
  onFocalLengthChange, onApertureChange, onSliderChange, onSensorChange,
}: {
  focalLength: number; aperture: number; sliderVal: number; sensorId: string; distance: number
  onFocalLengthChange: (v: number) => void; onApertureChange: (v: number) => void
  onSliderChange: (v: number) => void; onSensorChange: (v: string) => void
}) {
  const t = useTranslations('toolUI.hyperfocal-simulator')
  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{t('settings')}</h3>

      <div className={s.field}>
        <label className={s.fieldLabel}>{t('focalLength')}</label>
        <select className={s.select} value={focalLength} onChange={(e) => onFocalLengthChange(Number(e.target.value))}>
          {FOCAL_LENGTHS.map((fl) => (
            <option key={fl.value} value={fl.value}>
              {fl.value}mm{fl.label ? ` — ${fl.label}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>{t('aperture')}</label>
        <select className={s.select} value={aperture} onChange={(e) => onApertureChange(Number(e.target.value))}>
          {APERTURES.map((a) => (
            <option key={a} value={a}>f/{a}</option>
          ))}
        </select>
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          {t('focusDistance')} <span className={s.fieldValue}>{formatDistance(distance)}</span>
        </label>
        <input type="range" className={s.slider} min={0} max={1} step={0.001}
          value={sliderVal} onChange={(e) => onSliderChange(Number(e.target.value))} />
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>{t('sensor')}</label>
        <select className={s.select} value={sensorId} onChange={(e) => onSensorChange(e.target.value)}>
          {SENSORS.map((sen) => (
            <option key={sen.id} value={sen.id}>{sen.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
