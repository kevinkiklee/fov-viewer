'use client'

import { useState, useMemo } from 'react'
import { calcDoF } from '@/lib/math/dof'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import { DoFDiagram } from './DoFDiagram'
import styles from '../shared/Calculator.module.css'

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]

function formatDistance(meters: number): string {
  if (!isFinite(meters)) return '∞'
  if (meters < 1) return `${(meters * 100).toFixed(0)} cm`
  return `${meters.toFixed(2)} m`
}

/** Convert a linear 0–1 slider position to a log-scale distance in 0.3–100m */
function sliderToDistance(val: number): number {
  const minLog = Math.log(0.3)
  const maxLog = Math.log(100)
  return Math.exp(minLog + val * (maxLog - minLog))
}

/** Convert a distance back to 0–1 slider position */
function distanceToSlider(dist: number): number {
  const minLog = Math.log(0.3)
  const maxLog = Math.log(100)
  return (Math.log(dist) - minLog) / (maxLog - minLog)
}

export function DoFCalculator() {
  const [focalLength, setFocalLength] = useState(50)
  const [aperture, setAperture] = useState(2.8)
  const [sliderVal, setSliderVal] = useState(distanceToSlider(3))
  const [sensorId, setSensorId] = useState('ff')

  const distance = sliderToDistance(sliderVal)
  const sensor = SENSORS.find((s) => s.id === sensorId) ?? SENSORS[1]
  const coc = 0.03 / sensor.cropFactor

  const result = useMemo(
    () => calcDoF({ focalLength, aperture, distance, coc }),
    [focalLength, aperture, distance, coc],
  )

  return (
    <div>
      <div className={styles.layout}>
        <div className={styles.controls}>
          <div className={styles.field}>
            <label className={styles.label}>Focal Length</label>
            <select
              className={styles.select}
              value={focalLength}
              onChange={(e) => setFocalLength(Number(e.target.value))}
            >
              {FOCAL_LENGTHS.map((fl) => (
                <option key={fl.value} value={fl.value}>
                  {fl.value}mm{fl.label ? ` — ${fl.label}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Aperture</label>
            <select
              className={styles.select}
              value={aperture}
              onChange={(e) => setAperture(Number(e.target.value))}
            >
              {APERTURES.map((a) => (
                <option key={a} value={a}>
                  f/{a}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Subject Distance: <span className={styles.value}>{formatDistance(distance)}</span>
            </label>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={1}
              step={0.001}
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Sensor</label>
            <select
              className={styles.select}
              value={sensorId}
              onChange={(e) => setSensorId(e.target.value)}
            >
              {SENSORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.results}>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Near Focus</span>
            <span className={styles.resultValue}>{formatDistance(result.nearFocus)}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Far Focus</span>
            <span className={styles.resultValue}>{formatDistance(result.farFocus)}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Total DoF</span>
            <span className={styles.resultValue}>{formatDistance(result.totalDoF)}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Hyperfocal Distance</span>
            <span className={styles.resultValue}>{formatDistance(result.hyperfocal)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <DoFDiagram result={result} distance={distance} />
      </div>
    </div>
  )
}
