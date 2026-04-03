'use client'

import { useState, useMemo } from 'react'
import { rule500, ruleNPF, stackingTime, formatDuration } from '@/lib/math/startrail'
import { pixelPitch } from '@/lib/math/diffraction'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import { useQueryInit, useToolQuerySync, intParam, numParam, strParam, sensorParam } from '@/lib/utils/querySync'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import { StarTrailCanvas } from './StarTrailCanvas'
import css from './StarTrailCalculator.module.css'

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]
const EXPOSURE_OPTIONS = [15, 30, 60, 120]

const LATITUDE_PRESETS = [
  { label: 'Equator 0\u00B0', value: 0 },
  { label: 'Mid 45\u00B0', value: 45 },
  { label: 'Arctic 70\u00B0', value: 70 },
]

/** Derive sensor width from crop factor (FF = 36mm) */
function sensorWidth(cropFactor: number): number {
  return 36 / cropFactor
}

const PARAM_SCHEMA = {
  mode: strParam<'sharp' | 'trails'>('sharp', ['sharp', 'trails']),
  fl: intParam(24, 8, 800),
  s: sensorParam('ff'),
  mp: intParam(24, 1, 200),
  f: numParam(2.8, 1.4, 22),
  lat: intParam(45, 0, 90),
  exp: intParam(30, 1, 300),
  frames: intParam(60, 1, 9999),
  gap: intParam(2, 0, 60),
}

function ControlsPanel({
  mode,
  focalLength,
  sensorId,
  resolution,
  aperture,
  latitude,
  exposurePerFrame,
  numFrames,
  gap,
  sharpResults,
  trailResult,
  onModeChange,
  onFocalLengthChange,
  onSensorIdChange,
  onResolutionChange,
  onApertureChange,
  onLatitudeChange,
  onExposurePerFrameChange,
  onNumFramesChange,
  onGapChange,
}: {
  mode: 'sharp' | 'trails'
  focalLength: number
  sensorId: string
  resolution: number
  aperture: number
  latitude: number
  exposurePerFrame: number
  numFrames: number
  gap: number
  sharpResults: { max500: number; maxNPF: number }
  trailResult: number
  onModeChange: (m: 'sharp' | 'trails') => void
  onFocalLengthChange: (v: number) => void
  onSensorIdChange: (v: string) => void
  onResolutionChange: (v: number) => void
  onApertureChange: (v: number) => void
  onLatitudeChange: (v: number) => void
  onExposurePerFrameChange: (v: number) => void
  onNumFramesChange: (v: number) => void
  onGapChange: (v: number) => void
}) {
  return (
    <>
      {/* Mode toggle */}
      <div className={css.modeToggle}>
        <button
          className={`${css.modeBtn} ${mode === 'sharp' ? css.modeBtnActive : ''}`}
          onClick={() => onModeChange('sharp')}
          aria-pressed={mode === 'sharp'}
        >
          Sharp Stars
        </button>
        <button
          className={`${css.modeBtn} ${mode === 'trails' ? css.modeBtnActive : ''}`}
          onClick={() => onModeChange('trails')}
          aria-pressed={mode === 'trails'}
        >
          Star Trails
        </button>
      </div>

      {/* Camera controls */}
      <div className={css.field}>
        <label className={css.fieldLabel}>Focal Length</label>
        <select
          className={css.select}
          value={focalLength}
          onChange={(e) => onFocalLengthChange(Number(e.target.value))}
        >
          {FOCAL_LENGTHS.map((fl) => (
            <option key={fl.value} value={fl.value}>
              {fl.value}mm{fl.label ? ` \u2014 ${fl.label}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className={css.field}>
        <label className={css.fieldLabel}>Sensor</label>
        <select
          className={css.select}
          value={sensorId}
          onChange={(e) => onSensorIdChange(e.target.value)}
        >
          {SENSORS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className={css.field}>
        <label className={css.fieldLabel}>Resolution (MP)</label>
        <input
          type="number"
          className={css.input}
          value={resolution}
          min={1}
          max={200}
          onChange={(e) => onResolutionChange(Number(e.target.value) || 1)}
        />
      </div>

      <div className={css.field}>
        <label className={css.fieldLabel}>Aperture</label>
        <select
          className={css.select}
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

      {/* Latitude slider */}
      <div className={css.field}>
        <label className={css.fieldLabel}>
          Latitude: <span className={css.fieldValue}>{latitude}\u00B0</span>
        </label>
        <input
          type="range"
          className={css.slider}
          min={0}
          max={90}
          step={1}
          value={latitude}
          onChange={(e) => onLatitudeChange(Number(e.target.value))}
        />
      </div>

      {/* Trail mode controls */}
      {mode === 'trails' && (
        <>
          <div className={css.field}>
            <label className={css.fieldLabel}>Exposure per Frame</label>
            <select
              className={css.select}
              value={exposurePerFrame}
              onChange={(e) => onExposurePerFrameChange(Number(e.target.value))}
            >
              {EXPOSURE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}s
                </option>
              ))}
            </select>
          </div>
          <div className={css.field}>
            <label className={css.fieldLabel}>Number of Frames</label>
            <input
              type="number"
              className={css.input}
              value={numFrames}
              min={1}
              onChange={(e) => onNumFramesChange(Number(e.target.value) || 1)}
            />
          </div>
          <div className={css.field}>
            <label className={css.fieldLabel}>Gap Between Frames (s)</label>
            <input
              type="number"
              className={css.input}
              value={gap}
              min={0}
              onChange={(e) => onGapChange(Number(e.target.value) || 0)}
            />
          </div>
        </>
      )}

      {/* Results */}
      {mode === 'sharp' ? (
        <>
          <div className={css.resultCard}>
            <span className={css.resultLabel}>500 Rule</span>
            <span className={css.resultValue}>{sharpResults.max500.toFixed(1)}s</span>
          </div>
          <div className={css.resultCard}>
            <span className={css.resultLabel}>NPF Rule (more accurate)</span>
            <span className={css.resultValue}>{sharpResults.maxNPF.toFixed(1)}s</span>
          </div>
          <div className={css.resultCard}>
            <span className={css.resultLabel}>Recommendation</span>
            <span className={css.resultNote}>
              Use the NPF rule ({sharpResults.maxNPF.toFixed(1)}s) for pixel-level sharpness.
              The 500 rule ({sharpResults.max500.toFixed(1)}s) is a quick estimate but may show
              trailing on high-resolution sensors.
            </span>
          </div>
        </>
      ) : (
        <>
          <div className={css.resultCard}>
            <span className={css.resultLabel}>Total Shooting Time</span>
            <span className={css.resultValue}>{formatDuration(trailResult)}</span>
          </div>
          <div className={css.resultCard}>
            <span className={css.resultLabel}>Total Frames</span>
            <span className={css.resultValue}>{numFrames}</span>
          </div>
          <div className={css.resultCard}>
            <span className={css.resultLabel}>Total Exposure</span>
            <span className={css.resultValue}>
              {formatDuration(exposurePerFrame * numFrames)}
            </span>
          </div>
        </>
      )}
    </>
  )
}

export function StarTrailCalculator() {
  const [mode, setMode] = useState<'sharp' | 'trails'>('sharp')
  const [focalLength, setFocalLength] = useState(24)
  const [sensorId, setSensorId] = useState('ff')
  const [resolution, setResolution] = useState(24)
  const [aperture, setAperture] = useState(2.8)
  const [latitude, setLatitude] = useState(45)

  // Trail mode inputs
  const [exposurePerFrame, setExposurePerFrame] = useState(30)
  const [numFrames, setNumFrames] = useState(60)
  const [gap, setGap] = useState(2)
  useQueryInit(PARAM_SCHEMA, { mode: setMode, fl: setFocalLength, s: setSensorId, mp: setResolution, f: setAperture, lat: setLatitude, exp: setExposurePerFrame, frames: setNumFrames, gap: setGap })

  useToolQuerySync(
    { mode, fl: focalLength, s: sensorId, mp: resolution, f: aperture, lat: latitude, exp: exposurePerFrame, frames: numFrames, gap },
    PARAM_SCHEMA,
  )

  const sensor = SENSORS.find((s) => s.id === sensorId) ?? SENSORS[1]
  const width = sensorWidth(sensor.cropFactor)
  const pitch = pixelPitch(width, resolution)

  const sharpResults = useMemo(() => {
    const max500 = rule500(focalLength, sensor.cropFactor)
    const maxNPF = ruleNPF(aperture, focalLength, pitch)
    return { max500, maxNPF }
  }, [focalLength, sensor.cropFactor, aperture, pitch])

  const trailResult = useMemo(
    () => stackingTime(exposurePerFrame, numFrames, gap),
    [exposurePerFrame, numFrames, gap],
  )

  const totalExposure = exposurePerFrame * numFrames

  const controlsProps = {
    mode,
    focalLength,
    sensorId,
    resolution,
    aperture,
    latitude,
    exposurePerFrame,
    numFrames,
    gap,
    sharpResults,
    trailResult,
    onModeChange: setMode,
    onFocalLengthChange: setFocalLength,
    onSensorIdChange: setSensorId,
    onResolutionChange: setResolution,
    onApertureChange: setAperture,
    onLatitudeChange: setLatitude,
    onExposurePerFrameChange: setExposurePerFrame,
    onNumFramesChange: setNumFrames,
    onGapChange: setGap,
  }

  return (
    <div className={css.app}>
      <div className={css.appBody}>
        {/* Desktop sidebar */}
        <div className={css.sidebar}>
          <ToolActions toolName="Star Trail Calculator" toolSlug="star-trail-calculator" />
          <ControlsPanel {...controlsProps} />
        </div>

        {/* Canvas area */}
        <div className={css.canvasArea}>
          <div className={css.topbar}>
            <span className={css.presetStripLabel}>Latitude:</span>
            <div className={css.presetStrip}>
              {LATITUDE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  className={`${css.presetBtn} ${latitude === p.value ? css.presetBtnActive : ''}`}
                  onClick={() => setLatitude(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className={css.canvasMain}>
            <StarTrailCanvas
              mode={mode}
              maxExposure500={sharpResults.max500}
              maxExposureNPF={sharpResults.maxNPF}
              totalExposure={totalExposure}
              latitude={latitude}
              exposurePerFrame={exposurePerFrame}
            />
          </div>
        </div>
        <LearnPanel slug="star-trail-calculator" />
      </div>

      {/* Mobile: controls below canvas */}
      <div className={css.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>
    </div>
  )
}
