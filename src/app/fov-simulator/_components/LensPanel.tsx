'use client'

import { useMemo } from 'react'
import type { LensConfig } from '@/lib/types'
import { FOCAL_LENGTHS, FOCAL_MIN, FOCAL_MAX } from '@/lib/data/focalLengths'
import { SENSORS, getSensor } from '@/lib/data/sensors'
import { calcEquivFocalLength } from '@/lib/math/fov'
import styles from './FovSimulator.module.css'

// Logarithmic scale: maps focal length to 0-1000 slider position
const LOG_MIN = Math.log(FOCAL_MIN)
const LOG_MAX = Math.log(FOCAL_MAX)
const SLIDER_STEPS = 1000

function focalToSlider(focal: number): number {
  return Math.round(((Math.log(focal) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * SLIDER_STEPS)
}

function sliderToFocal(pos: number): number {
  return Math.round(Math.exp(LOG_MIN + (pos / SLIDER_STEPS) * (LOG_MAX - LOG_MIN)))
}

// Snap to preset if within this many slider units
const SNAP_THRESHOLD = 15

interface LensPanelProps {
  label: string
  color: string
  config: LensConfig
  isActive: boolean
  collapsed: boolean
  onChange: (updates: Partial<LensConfig>) => void
  onFocus: () => void
  onToggleCollapse: () => void
  onRemove?: () => void
}

export function LensPanel({
  label, color, config, isActive, collapsed, onChange, onFocus, onToggleCollapse, onRemove,
}: LensPanelProps) {
  const sensor = getSensor(config.sensorId)
  const isCrop = sensor.cropFactor > 1
  const minFocal = isCrop ? FOCAL_MIN : 14
  const equiv = calcEquivFocalLength(config.focalLength, sensor.cropFactor)

  const sliderMin = focalToSlider(minFocal)
  const sliderVal = focalToSlider(Math.max(config.focalLength, minFocal))

  const presetPositions = useMemo(
    () => FOCAL_LENGTHS.filter((fl) => fl.value >= minFocal).map((fl) => ({
      value: fl.value,
      pct: ((focalToSlider(fl.value) - sliderMin) / (SLIDER_STEPS - sliderMin)) * 100,
    })),
    [minFocal, sliderMin],
  )

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pos = Number(e.target.value)
    let focal = sliderToFocal(pos)

    // Snap to nearest preset if close
    for (const fl of FOCAL_LENGTHS) {
      if (fl.value < minFocal) continue
      const presetPos = focalToSlider(fl.value)
      if (Math.abs(pos - presetPos) <= SNAP_THRESHOLD) {
        focal = fl.value
        break
      }
    }

    focal = Math.max(minFocal, Math.min(FOCAL_MAX, focal))
    onChange({ focalLength: focal })
  }

  return (
    <div
      className={`${styles.lensPanel} ${isActive ? styles.lensPanelActive : ''}`}
      style={{ borderLeftColor: color, '--lens-color': color } as React.CSSProperties}
      onClick={onFocus}
    >
      <div className={styles.lensPanelHeader}>
        <span className={styles.lensPanelLabel} style={{ color }}>{label}</span>
        <span className={styles.lensPanelEquiv}>
          {sensor.cropFactor !== 1 ? `≡ ${equiv}mm equiv` : ''}
        </span>
        {onRemove && (
          <button
            className={styles.lensPanelRemove}
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            title="Remove lens"
            aria-label={`Remove ${label}`}
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles.lensPanelFocal}>
        <div className={styles.lensPanelFocalRow}>
          <span className={styles.lensPanelSublabel}>Focal length</span>
          <span className={styles.lensPanelValue}>{config.focalLength}mm</span>
        </div>
        <div className={styles.lensPanelSliderWrap}>
          <input
            type="range"
            className={styles.lensPanelSlider}
            min={sliderMin}
            max={SLIDER_STEPS}
            step={1}
            value={sliderVal}
            onChange={handleSliderChange}
            style={{ '--slider-color': color } as React.CSSProperties}
            aria-label={`${label} focal length: ${config.focalLength}mm`}
          />
          <div className={styles.lensPanelTicks}>
            {presetPositions.map((p) => (
              <div
                key={p.value}
                className={styles.lensPanelTick}
                style={{ left: `${p.pct}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className={styles.lensPanelPresets}>
            {FOCAL_LENGTHS.filter((fl) => fl.value >= minFocal).map((fl) => (
              <button
                key={fl.value}
                className={`${styles.lensPanelPreset} ${config.focalLength === fl.value ? styles.lensPanelPresetActive : ''}`}
                style={config.focalLength === fl.value ? { background: color, color: '#fff' } : undefined}
                onClick={(e) => { e.stopPropagation(); onChange({ focalLength: fl.value }) }}
              >
                {fl.value}mm
              </button>
            ))}
          </div>

          <div className={styles.lensPanelSensorRow}>
            <span className={styles.lensPanelSublabel}>Sensor</span>
            <select
              className={styles.lensPanelSelect}
              value={config.sensorId}
              aria-label={`${label} sensor`}
              onChange={(e) => {
                const newSensor = getSensor(e.target.value)
                const newMin = newSensor.cropFactor > 1 ? FOCAL_MIN : 14
                const updates: Partial<LensConfig> = { sensorId: e.target.value }
                if (config.focalLength < newMin) updates.focalLength = newMin
                onChange(updates)
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {SENSORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.cropFactor}×)
                </option>
              ))}
            </select>
          </div>

        </>
      )}
    </div>
  )
}
