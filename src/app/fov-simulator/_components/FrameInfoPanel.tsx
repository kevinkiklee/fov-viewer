'use client'

import { useTranslations } from 'next-intl'
import type { LensConfig } from '@/lib/types'
import { calcFOV, calcFrameWidth } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import { LENS_COLORS, LENS_LABELS, DISTANCE_PRESETS } from '@/lib/data/fovSimulator'
import styles from './FrameInfoPanel.module.css'
const SLIDER_STEPS = 500
const LOG_MIN = Math.log(3)
const LOG_MAX = Math.log(100)

function distToSlider(dist: number): number {
  return ((Math.log(dist) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * SLIDER_STEPS
}

function sliderToDist(value: number): number {
  return Math.exp(LOG_MIN + (value / SLIDER_STEPS) * (LOG_MAX - LOG_MIN))
}

interface FrameInfoPanelProps {
  lenses: LensConfig[]
  distance: number
  showGuides: boolean
  onDistanceChange: (d: number) => void
  onShowGuidesChange: (v: boolean) => void
}

export function FrameInfoPanel({
  lenses,
  distance,
  showGuides,
  onDistanceChange,
  onShowGuidesChange,
}: FrameInfoPanelProps) {
  const t = useTranslations('toolUI.fov-simulator')
  return (
    <div className={styles.panel}>
      <div className={styles.title}>{t('frameInfo')}</div>

      <div className={styles.readout}>
        {lenses.map((lens, i) => {
          const sensor = getSensor(lens.sensorId)
          const fov = calcFOV(lens.focalLength, sensor.cropFactor)
          const frameWidth = calcFrameWidth(fov.horizontal, distance)
          return (
            <div key={i} className={styles.readoutRow}>
              <span className={styles.readoutLabel} style={{ color: LENS_COLORS[i] }}>
                {LENS_LABELS[i]} {lens.focalLength}mm
              </span>
              <span className={styles.readoutValue}>
                {frameWidth.toFixed(1)}ft {t('wide')}
              </span>
            </div>
          )
        })}
      </div>

      <div className={styles.sliderSection}>
        <div className={styles.sliderLabel}>
          <span>{t('distance')}</span>
          <span>{distance.toFixed(0)}ft</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={SLIDER_STEPS}
          step={1}
          value={distToSlider(distance)}
          onChange={(e) => onDistanceChange(Math.round(sliderToDist(Number(e.target.value))))}
        />
      </div>

      <div className={styles.presets}>
        {DISTANCE_PRESETS.map((d) => (
          <button
            key={d}
            className={`${styles.preset} ${distance === d ? styles.presetActive : ''}`}
            onClick={() => onDistanceChange(d)}
          >
            {d}ft
          </button>
        ))}
      </div>

      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={showGuides}
          onChange={(e) => onShowGuidesChange(e.target.checked)}
        />
        {t('showFramingGuides')}
      </label>
    </div>
  )
}
