'use client'

import { useState, useMemo } from 'react'
import { reciprocalRule, formatShutterSpeed } from '@/lib/math/exposure'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import { getToolBySlug } from '@/lib/data/tools'
import { parseQueryState, useToolQuerySync, intParam, sensorParam } from '@/lib/utils/querySync'
import { LearnPanel } from '@/components/shared/LearnPanel'
import calc from '../shared/Calculator.module.css'
import ss from './ShutterSpeedGuide.module.css'

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

const tool = getToolBySlug('shutter-speed-guide')!

function ControlsPanel({ focalLength, sensorId, stabIdx, motionIdx, onFocalLengthChange, onSensorChange, onStabChange, onMotionChange }: {
  focalLength: number
  sensorId: string
  stabIdx: number
  motionIdx: number
  onFocalLengthChange: (fl: number) => void
  onSensorChange: (id: string) => void
  onStabChange: (idx: number) => void
  onMotionChange: (idx: number) => void
}) {
  return (
    <>
      <div className={ss.header}>
        <h1 className={ss.title}>{tool.name}</h1>
        <p className={ss.description}>{tool.description}</p>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>Focal Length</label>
        <select
          className={calc.select}
          value={focalLength}
          onChange={(e) => onFocalLengthChange(Number(e.target.value))}
        >
          {FOCAL_LENGTHS.map((fl) => (
            <option key={fl.value} value={fl.value}>
              {fl.value}mm{fl.label ? ` — ${fl.label}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>Sensor</label>
        <select
          className={calc.select}
          value={sensorId}
          onChange={(e) => onSensorChange(e.target.value)}
        >
          {SENSORS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>Stabilization</label>
        <select
          className={calc.select}
          value={stabIdx}
          onChange={(e) => onStabChange(Number(e.target.value))}
        >
          {STABILIZATION.map((s, i) => (
            <option key={s.label} value={i}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>Subject Motion</label>
        <select
          className={calc.select}
          value={motionIdx}
          onChange={(e) => onMotionChange(Number(e.target.value))}
        >
          {SUBJECT_MOTION.map((m, i) => (
            <option key={m.label} value={i}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </>
  )
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
    const reciprocal = reciprocalRule(focalLength, sensor.cropFactor, stab.stops)
    const baseReciprocal = 1 / (focalLength * sensor.cropFactor)
    const motionNeed = baseReciprocal / Math.pow(2, motion.stops)
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

  const controlsProps = {
    focalLength,
    sensorId,
    stabIdx,
    motionIdx,
    onFocalLengthChange: setFocalLength,
    onSensorChange: setSensorId,
    onStabChange: setStabIdx,
    onMotionChange: setMotionIdx,
  }

  return (
    <div className={ss.app}>
      <div className={ss.appBody}>
        <div className={ss.sidebar}>
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={ss.main}>
          <div className={ss.resultDisplay}>
            <span className={ss.resultCaption}>Recommended Minimum Shutter Speed</span>
            <span className={ss.resultBig}>{formatShutterSpeed(recommended)}</span>
            <div className={ss.resultExplanation}>{explanation}</div>
          </div>
        </div>

        <LearnPanel slug="shutter-speed-guide" />
      </div>

      <div className={ss.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>
    </div>
  )
}
