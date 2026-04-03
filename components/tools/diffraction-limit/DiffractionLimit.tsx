'use client'

import { useState, useMemo } from 'react'
import { pixelPitch, diffractionLimitedAperture } from '@/lib/math/diffraction'
import { SENSORS } from '@/lib/data/sensors'
import styles from '../shared/Calculator.module.css'

/** Derive sensor width from crop factor (FF = 36mm) */
function sensorWidth(cropFactor: number): number {
  return 36 / cropFactor
}

const FSTOPS = [2.8, 4, 5.6, 8, 11, 16, 22]

export function DiffractionLimit() {
  const [sensorId, setSensorId] = useState('ff')
  const [resolution, setResolution] = useState(24)

  const sensor = SENSORS.find((s) => s.id === sensorId) ?? SENSORS[1]
  const width = sensorWidth(sensor.cropFactor)

  const { pitch, limitAperture } = useMemo(() => {
    const p = pixelPitch(width, resolution)
    const a = diffractionLimitedAperture(p)
    return { pitch: p, limitAperture: a }
  }, [width, resolution])

  // Position of limit on the scale (2.8 to 22)
  const minF = Math.log(2.8)
  const maxF = Math.log(22)
  const limitLog = Math.log(Math.min(Math.max(limitAperture, 2.8), 22))
  const limitPercent = ((limitLog - minF) / (maxF - minF)) * 100

  return (
    <div className={styles.layout}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.label}>Sensor</label>
          <select
            className={styles.select}
            value={sensorId}
            onChange={(e) => setSensorId(e.target.value)}
          >
            {SENSORS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({sensorWidth(s.cropFactor).toFixed(1)}mm)
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Resolution (MP)</label>
          <input
            type="number"
            className={styles.input}
            value={resolution}
            min={1}
            max={200}
            onChange={(e) => setResolution(Number(e.target.value) || 1)}
          />
        </div>
      </div>

      <div>
        <div className={styles.results}>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Pixel Pitch</span>
            <span className={styles.resultValue}>{pitch.toFixed(2)} um</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Diffraction Limit</span>
            <span className={styles.resultValue}>f/{limitAperture.toFixed(1)}</span>
          </div>
        </div>

        {/* Visual aperture scale */}
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <div
            style={{
              position: 'relative',
              height: 40,
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div
              style={{
                width: `${limitPercent}%`,
                background: 'color-mix(in srgb, green 30%, transparent)',
                borderRight: '2px solid var(--text-primary)',
              }}
            />
            <div
              style={{
                flex: 1,
                background: 'color-mix(in srgb, red 30%, transparent)',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'var(--space-xs)',
            }}
          >
            {FSTOPS.map((f) => {
              const pos = ((Math.log(f) - minF) / (maxF - minF)) * 100
              return (
                <span
                  key={f}
                  className={styles.value}
                  style={{
                    position: 'relative',
                    left: `${pos - 50}%`,
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  f/{f}
                </span>
              )
            })}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'var(--space-xs)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <span style={{ color: 'green' }}>Sharp (below f/{limitAperture.toFixed(1)})</span>
            <span style={{ color: 'red' }}>Diffraction-softened (above f/{limitAperture.toFixed(1)})</span>
          </div>
        </div>
      </div>
    </div>
  )
}
