'use client'

import { useState, useMemo } from 'react'
import { reciprocalRule, formatShutterSpeed } from '@/lib/math/exposure'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import { parseQueryState, useToolQuerySync, intParam, sensorParam } from '@/lib/utils/querySync'
import styles from '../shared/Calculator.module.css'

const STABILIZATION = [
  { label: 'None', stops: 0 },
  { label: 'OIS (2 stops)', stops: 2 },
  { label: 'IBIS (3 stops)', stops: 3 },
  { label: 'OIS + IBIS (5 stops)', stops: 5 },
]

const SUBJECT_MOTION = [
  { label: 'Still', stops: 0 },
  { label: 'Slow walk', stops: 1 },
  { label: 'Walking', stops: 2 },
  { label: 'Running', stops: 3 },
  { label: 'Vehicle', stops: 4 },
]

const PARAM_SCHEMA = {
  fl: intParam(50, 8, 800),
  s: sensorParam('ff'),
  stab: intParam(0, 0, 3),
  motion: intParam(0, 0, 4),
}

export function ShutterSpeedGuide() {
  const params = parseQueryState(PARAM_SCHEMA)
  const [focalLength, setFocalLength] = useState(params.fl ?? 50)
  const [sensorId, setSensorId] = useState(params.s ?? 'ff')
  const [stabIdx, setStabIdx] = useState(params.stab ?? 0)
  const [motionIdx, setMotionIdx] = useState(params.motion ?? 0)

  useToolQuerySync({ fl: focalLength, s: sensorId, stab: stabIdx, motion: motionIdx }, PARAM_SCHEMA)

  const sensor = SENSORS.find((s) => s.id === sensorId) ?? SENSORS[1]
  const stab = STABILIZATION[stabIdx]
  const motion = SUBJECT_MOTION[motionIdx]

  const { recommended, explanation } = useMemo(() => {
    // Base reciprocal rule with stabilization
    const reciprocal = reciprocalRule(focalLength, sensor.cropFactor, stab.stops)

    // Motion requirement: base shutter needed for motion = 1/(focal*crop) / 2^motionStops
    // i.e., we need a FASTER shutter by motionStops
    const baseReciprocal = 1 / (focalLength * sensor.cropFactor)
    const motionNeed = baseReciprocal / Math.pow(2, motion.stops)

    // The recommended speed is the faster (smaller) of reciprocal-adjusted and motion need
    const rec = Math.min(reciprocal, motionNeed)

    let expl: string
    if (motion.stops === 0) {
      if (stab.stops > 0) {
        expl = `Reciprocal rule: 1/${Math.round(focalLength * sensor.cropFactor)} adjusted by ${stab.stops} stops of stabilization.`
      } else {
        expl = `Reciprocal rule: 1/${Math.round(focalLength * sensor.cropFactor)} for sharp handheld shots.`
      }
    } else if (motionNeed <= reciprocal) {
      expl = `Subject motion requires a faster shutter (${motion.label}: +${motion.stops} stops) which overrides the stabilized reciprocal rule.`
    } else {
      expl = `Reciprocal rule (with ${stab.stops > 0 ? stab.stops + ' stops stabilization' : 'no stabilization'}) is the limiting factor despite subject motion.`
    }

    return { recommended: rec, explanation: expl }
  }, [focalLength, sensor.cropFactor, stab.stops, motion.stops, motion.label])

  return (
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

        <div className={styles.field}>
          <label className={styles.label}>Stabilization</label>
          <select
            className={styles.select}
            value={stabIdx}
            onChange={(e) => setStabIdx(Number(e.target.value))}
          >
            {STABILIZATION.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Subject Motion</label>
          <select
            className={styles.select}
            value={motionIdx}
            onChange={(e) => setMotionIdx(Number(e.target.value))}
          >
            {SUBJECT_MOTION.map((m, i) => (
              <option key={m.label} value={i}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.results}>
        <div className={styles.resultCard} style={{ gridColumn: '1 / -1' }}>
          <span className={styles.resultLabel}>Recommended Minimum Shutter Speed</span>
          <span className={styles.resultValue}>{formatShutterSpeed(recommended)}</span>
        </div>
        <div className={styles.resultCard} style={{ gridColumn: '1 / -1' }}>
          <span className={styles.resultLabel}>Explanation</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {explanation}
          </span>
        </div>
      </div>
    </div>
  )
}
