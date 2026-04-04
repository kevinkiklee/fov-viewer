'use client'

import { useState, useMemo, useCallback } from 'react'
import { calcDoF } from '@/lib/math/dof'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import { useQueryInit, useToolQuerySync, intParam, numParam, strParam, sensorParam } from '@/lib/utils/querySync'
import { ToolActions } from '@/components/shared/ToolActions'
import { DoFDiagram } from '@/components/shared/DoFDiagram'
import { DoFCanvas } from '@/components/shared/DoFCanvas'
import type { SceneKey } from '@/components/shared/DoFCanvas'
import { HyperfocalResults } from './HyperfocalResults'
import { HyperfocalMiniTable } from './HyperfocalMiniTable'
import { HyperfocalBadge } from './HyperfocalBadge'
import s from './HyperfocalSimulator.module.css'

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]

type HyperfocalScene = 'landscape' | 'street'

const SCENE_PRESETS: { key: HyperfocalScene; label: string }[] = [
  { key: 'landscape', label: 'Landscape' },
  { key: 'street', label: 'Street' },
]

const PARAM_SCHEMA = {
  fl: intParam(24, 8, 800),
  f: numParam(8, 1.4, 22),
  d: numParam(3, 0.3, 100),
  s: sensorParam('ff'),
  scene: strParam<HyperfocalScene>('landscape', ['landscape', 'street']),
}

function formatDistance(meters: number): string {
  if (!isFinite(meters)) return '∞'
  if (meters < 1) return `${(meters * 100).toFixed(0)} cm`
  return `${meters.toFixed(2)} m`
}

function sliderToDistance(val: number): number {
  const minLog = Math.log(0.3)
  const maxLog = Math.log(100)
  return Math.exp(minLog + val * (maxLog - minLog))
}

function distanceToSlider(dist: number): number {
  const minLog = Math.log(0.3)
  const maxLog = Math.log(100)
  return (Math.log(dist) - minLog) / (maxLog - minLog)
}

function SettingsPanel({
  focalLength, aperture, sliderVal, sensorId, distance,
  onFocalLengthChange, onApertureChange, onSliderChange, onSensorChange,
}: {
  focalLength: number; aperture: number; sliderVal: number; sensorId: string; distance: number
  onFocalLengthChange: (v: number) => void; onApertureChange: (v: number) => void
  onSliderChange: (v: number) => void; onSensorChange: (v: string) => void
}) {
  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>Settings</h3>

      <div className={s.field}>
        <label className={s.fieldLabel}>Focal Length</label>
        <select className={s.select} value={focalLength} onChange={(e) => onFocalLengthChange(Number(e.target.value))}>
          {FOCAL_LENGTHS.map((fl) => (
            <option key={fl.value} value={fl.value}>
              {fl.value}mm{fl.label ? ` — ${fl.label}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>Aperture</label>
        <select className={s.select} value={aperture} onChange={(e) => onApertureChange(Number(e.target.value))}>
          {APERTURES.map((a) => (
            <option key={a} value={a}>f/{a}</option>
          ))}
        </select>
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          Focus Distance: <span className={s.fieldValue}>{formatDistance(distance)}</span>
        </label>
        <input
          type="range" className={s.slider}
          min={0} max={1} step={0.001}
          value={sliderVal}
          onChange={(e) => onSliderChange(Number(e.target.value))}
        />
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>Sensor</label>
        <select className={s.select} value={sensorId} onChange={(e) => onSensorChange(e.target.value)}>
          {SENSORS.map((sen) => (
            <option key={sen.id} value={sen.id}>{sen.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function HyperfocalSimulator() {
  const [focalLength, setFocalLength] = useState(24)
  const [aperture, setAperture] = useState(8)
  const [sliderVal, setSliderVal] = useState(distanceToSlider(3))
  const [sensorId, setSensorId] = useState('ff')
  const [scene, setScene] = useState<HyperfocalScene>('landscape')

  const distance = sliderToDistance(sliderVal)

  useQueryInit(PARAM_SCHEMA, {
    fl: setFocalLength,
    f: setAperture,
    d: (v: number) => setSliderVal(distanceToSlider(v)),
    s: setSensorId,
    scene: setScene,
  })
  useToolQuerySync({ fl: focalLength, f: aperture, d: distance, s: sensorId, scene }, PARAM_SCHEMA)

  const sensor = SENSORS.find((sen) => sen.id === sensorId) ?? SENSORS[1]
  const coc = 0.03 / sensor.cropFactor

  const result = useMemo(
    () => calcDoF({ focalLength, aperture, distance, coc }),
    [focalLength, aperture, distance, coc],
  )

  const focusNormalized = distanceToSlider(distance)
  const isAtHyperfocal = distance >= result.hyperfocal

  const handleDiagramDistanceChange = useCallback((meters: number) => {
    setSliderVal(distanceToSlider(meters))
  }, [])

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const normalizedY = (e.clientY - rect.top) / rect.height
    setSliderVal(Math.max(0, Math.min(1, 1 - normalizedY)))
  }, [])

  const settingsProps = {
    focalLength, aperture, sliderVal, sensorId, distance,
    onFocalLengthChange: setFocalLength,
    onApertureChange: setAperture,
    onSliderChange: setSliderVal,
    onSensorChange: setSensorId,
  }

  return (
    <div className={s.app}>
      <div className={s.appBody}>
        <div className={s.sidebar}>
          <ToolActions toolName="Hyperfocal Distance Simulator" toolSlug="hyperfocal-simulator" />
          <SettingsPanel {...settingsProps} />
          <div className={s.panel}>
            <HyperfocalResults result={result} distance={distance} isAtHyperfocal={isAtHyperfocal} />
          </div>
          <div className={s.panel}>
            <HyperfocalMiniTable focalLength={focalLength} aperture={aperture} coc={coc} />
          </div>
        </div>

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

          <div className={s.canvasMain} onPointerDown={handleCanvasPointerDown}>
            <DoFCanvas
              focusDistance={focusNormalized}
              aperture={aperture}
              scene={scene as SceneKey}
              className={s.canvas}
            />
            <HyperfocalBadge isAtHyperfocal={isAtHyperfocal} nearLimit={result.nearFocus} />
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

      <div className={s.mobileControls}>
        <SettingsPanel {...settingsProps} />
        <div className={s.panel}>
          <HyperfocalResults result={result} distance={distance} isAtHyperfocal={isAtHyperfocal} />
        </div>
      </div>
    </div>
  )
}
