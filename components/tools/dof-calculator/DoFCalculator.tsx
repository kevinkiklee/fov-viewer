'use client'

import { useState, useMemo, useCallback } from 'react'
import { calcDoF } from '@/lib/math/dof'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import { parseQueryState, useToolQuerySync, intParam, numParam, strParam, sensorParam } from '@/lib/utils/querySync'
import { DoFDiagram } from './DoFDiagram'
import { DoFCanvas } from './DoFCanvas'
import type { SceneKey } from './DoFCanvas'
import s from './DoFCalculator.module.css'

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]

const PARAM_SCHEMA = {
  fl: intParam(50, 8, 800),
  f: numParam(2.8, 1.4, 22),
  d: numParam(3, 0.3, 100),
  s: sensorParam('ff'),
  scene: strParam<SceneKey>('portrait', ['portrait', 'landscape', 'street', 'macro']),
}

const SCENE_PRESETS: { key: SceneKey; label: string }[] = [
  { key: 'portrait', label: 'Portrait' },
  { key: 'landscape', label: 'Landscape' },
  { key: 'street', label: 'Street' },
  { key: 'macro', label: 'Macro' },
]

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

function SettingsPanel({
  focalLength,
  aperture,
  sliderVal,
  sensorId,
  distance,
  onFocalLengthChange,
  onApertureChange,
  onSliderChange,
  onSensorChange,
}: {
  focalLength: number
  aperture: number
  sliderVal: number
  sensorId: string
  distance: number
  onFocalLengthChange: (v: number) => void
  onApertureChange: (v: number) => void
  onSliderChange: (v: number) => void
  onSensorChange: (v: string) => void
}) {
  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>Settings</h3>

      <div className={s.field}>
        <label className={s.fieldLabel}>Focal Length</label>
        <select
          className={s.select}
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

      <div className={s.field}>
        <label className={s.fieldLabel}>Aperture</label>
        <select
          className={s.select}
          value={aperture}
          onChange={(e) => onApertureChange(Number(e.target.value))}
        >
          {APERTURES.map((a) => (
            <option key={a} value={a}>
              f/{a}
            </option>
          ))}
        </select>
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          Subject Distance: <span className={s.fieldValue}>{formatDistance(distance)}</span>
        </label>
        <input
          type="range"
          className={s.slider}
          min={0}
          max={1}
          step={0.001}
          value={sliderVal}
          onChange={(e) => onSliderChange(Number(e.target.value))}
        />
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>Sensor</label>
        <select
          className={s.select}
          value={sensorId}
          onChange={(e) => onSensorChange(e.target.value)}
        >
          {SENSORS.map((sensor) => (
            <option key={sensor.id} value={sensor.id}>
              {sensor.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function ResultsPanel({ nearFocus, farFocus, totalDoF, hyperfocal }: {
  nearFocus: number
  farFocus: number
  totalDoF: number
  hyperfocal: number
}) {
  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>Results</h3>
      <div className={s.resultsGrid}>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>Near Focus</span>
          <span className={s.resultValue}>{formatDistance(nearFocus)}</span>
        </div>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>Far Focus</span>
          <span className={s.resultValue}>{formatDistance(farFocus)}</span>
        </div>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>Total DoF</span>
          <span className={s.resultValue}>{formatDistance(totalDoF)}</span>
        </div>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>Hyperfocal</span>
          <span className={s.resultValue}>{formatDistance(hyperfocal)}</span>
        </div>
      </div>
    </div>
  )
}

export function DoFCalculator() {
  const params = parseQueryState(PARAM_SCHEMA)
  const [focalLength, setFocalLength] = useState(params.fl ?? 50)
  const [aperture, setAperture] = useState(params.f ?? 2.8)
  const [sliderVal, setSliderVal] = useState(distanceToSlider(params.d ?? 3))
  const [sensorId, setSensorId] = useState(params.s ?? 'ff')
  const [scene, setScene] = useState<SceneKey>(params.scene ?? 'portrait')

  const distance = sliderToDistance(sliderVal)

  useToolQuerySync({ fl: focalLength, f: aperture, d: distance, s: sensorId, scene }, PARAM_SCHEMA)

  const sensor = SENSORS.find((sen) => sen.id === sensorId) ?? SENSORS[1]
  const coc = 0.03 / sensor.cropFactor

  const result = useMemo(
    () => calcDoF({ focalLength, aperture, distance, coc }),
    [focalLength, aperture, distance, coc],
  )

  const focusNormalized = distanceToSlider(distance)

  const handleDiagramDistanceChange = useCallback((meters: number) => {
    setSliderVal(distanceToSlider(meters))
  }, [])

  const settingsProps = {
    focalLength,
    aperture,
    sliderVal,
    sensorId,
    distance,
    onFocalLengthChange: setFocalLength,
    onApertureChange: setAperture,
    onSliderChange: setSliderVal,
    onSensorChange: setSensorId,
  }

  const resultsProps = {
    nearFocus: result.nearFocus,
    farFocus: result.farFocus,
    totalDoF: result.totalDoF,
    hyperfocal: result.hyperfocal,
  }

  return (
    <div className={s.app}>
      <div className={s.appBody}>
        {/* Desktop sidebar */}
        <div className={s.sidebar}>
          <div className={s.header}>
            <h2 className={s.title}>Depth of Field Calculator</h2>
            <p className={s.description}>Calculate DoF and visualize bokeh for any lens and sensor.</p>
          </div>
          <SettingsPanel {...settingsProps} />
          <ResultsPanel {...resultsProps} />
        </div>

        {/* Canvas area */}
        <div className={s.canvasArea}>
          <div className={s.canvasTopbar}>
            <span className={s.presetLabel}>Scene:</span>
            {SCENE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                className={`${s.presetBtn} ${scene === preset.key ? s.presetBtnActive : ''}`}
                onClick={() => setScene(preset.key)}
                aria-pressed={scene === preset.key}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className={s.canvasMain}>
            <DoFCanvas
              focusDistance={focusNormalized}
              aperture={aperture}
              scene={scene}
              className={s.canvas}
            />
          </div>

          <div className={s.depthBar}>
            <DoFDiagram
              result={result}
              distance={distance}
              onDistanceChange={handleDiagramDistanceChange}
            />
          </div>
        </div>
      </div>

      {/* Mobile: controls below canvas */}
      <div className={s.mobileControls}>
        <SettingsPanel {...settingsProps} />
        <ResultsPanel {...resultsProps} />
      </div>
    </div>
  )
}
