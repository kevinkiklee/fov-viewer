'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import { rule500, ruleNPF, stackingTime, formatDuration } from '@/lib/math/startrail'
import { pixelPitch } from '@/lib/math/diffraction'
import { SENSORS } from '@/lib/data/sensors'
import { useQueryInit, useToolQuerySync, intParam, numParam, strParam, sensorParam } from '@/lib/utils/querySync'
import { ControlPanel, FocalLengthField, FieldRow, NumberStepper, SliderField, controlPanelStyles as cp } from '@/components/shared/ControlPanel'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { ToolActions } from '@/components/shared/ToolActions'
import { StarTrailCanvas, type StarTrailCanvasHandle } from './StarTrailCanvas'
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
  gap: intParam(1, 0, 60),
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
      {/* Results — above mode toggle for visibility */}
      {mode === 'sharp' ? (
        <>
          <div className={css.resultRow}>
            <div className={css.resultCardAccent}>
              <span className={css.resultLabel}>500 Rule</span>
              <span className={css.resultValue}>{sharpResults.max500.toFixed(1)}s</span>
            </div>
            <div className={css.resultCardAccent}>
              <span className={css.resultLabel}>NPF Rule</span>
              <span className={css.resultValue}>{sharpResults.maxNPF.toFixed(1)}s</span>
            </div>
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
          <div className={css.resultRow}>
            <div className={css.resultCardAccent}>
              <span className={css.resultLabel}>Shooting Time</span>
              <span className={css.resultValue}>{formatDuration(trailResult)}</span>
            </div>
            <div className={css.resultCardAccent}>
              <span className={css.resultLabel}>Exposure</span>
              <span className={css.resultValue}>
                {formatDuration(exposurePerFrame * numFrames)}
              </span>
            </div>
          </div>
        </>
      )}

      <ModeToggle
        title="Display Mode"
        options={[
          { value: 'trails', label: 'Star Trails' },
          { value: 'sharp', label: 'Single Shot' },
        ]}
        value={mode}
        onChange={onModeChange}
        sticky
      />

      {/* Trail mode controls card */}
      {mode === 'trails' && (
        <ControlPanel title="Stacking">
          <FieldRow label="Exposure / frame (sec)" description="Shutter speed for each individual frame">
            <NumberStepper value={exposurePerFrame} min={1} max={600} onChange={onExposurePerFrameChange} />
          </FieldRow>

          <FieldRow label="Frames" description="Total number of photos to stack">
            <NumberStepper value={numFrames} min={1} max={9999} onChange={onNumFramesChange} />
          </FieldRow>

          <FieldRow label="Gap (sec)" description="Delay between frames for buffer write">
            <NumberStepper value={gap} min={0} max={60} onChange={onGapChange} />
          </FieldRow>
        </ControlPanel>
      )}

      {/* Camera controls card */}
      <ControlPanel title="Camera">
        <FocalLengthField value={focalLength} onChange={onFocalLengthChange} />

        <FieldRow label="Sensor">
          <select
            className={cp.select}
            value={sensorId}
            onChange={(e) => onSensorIdChange(e.target.value)}
          >
            {SENSORS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </FieldRow>

        <FieldRow label="Resolution (MP)">
          <NumberStepper value={resolution} min={1} max={200} onChange={onResolutionChange} />
        </FieldRow>

        <FieldRow label="Aperture">
          <select
            className={cp.select}
            value={aperture}
            onChange={(e) => onApertureChange(Number(e.target.value))}
          >
            {APERTURES.map((a) => (
              <option key={a} value={a}>
                f/{a}
              </option>
            ))}
          </select>
        </FieldRow>
      </ControlPanel>

      {/* Latitude card */}
      <ControlPanel title="Latitude">
        <SliderField label="Position" value={latitude} min={0} max={90} unit="°" onChange={onLatitudeChange} />
        <button
          className={cp.actionBtn}
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (pos) => onLatitudeChange(Math.round(Math.abs(pos.coords.latitude))),
              () => {},
            )
          }}
        >
          📍 Use My Location
        </button>
      </ControlPanel>
    </>
  )
}

function drawInfoOverlay(canvas: HTMLCanvasElement, info: {
  mode: string; focalLength: number; sensor: string; aperture: number;
  latitude: number; resolution: number;
  sharpResults?: { max500: number; maxNPF: number };
  trailInfo?: { exposurePerFrame: number; numFrames: number; totalTime: string; totalExposure: string };
}) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = window.devicePixelRatio || 1
  const w = canvas.width / dpr

  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Semi-transparent bar at bottom
  const barH = info.mode === 'trails' ? 56 : 44
  const h = canvas.height / dpr
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, h - barH, w, barH)

  // Settings line
  ctx.fillStyle = '#ccc'
  ctx.font = '11px system-ui, sans-serif'
  const settingsLine = `${info.focalLength}mm  ·  f/${info.aperture}  ·  ${info.sensor}  ·  ${info.resolution}MP  ·  Lat ${info.latitude}°`
  ctx.fillText(settingsLine, 12, h - barH + 16)

  // Results line
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 12px system-ui, sans-serif'
  if (info.mode === 'sharp' && info.sharpResults) {
    ctx.fillText(`500 Rule: ${info.sharpResults.max500.toFixed(1)}s  ·  NPF Rule: ${info.sharpResults.maxNPF.toFixed(1)}s`, 12, h - barH + 36)
  } else if (info.mode === 'trails' && info.trailInfo) {
    ctx.fillText(`${info.trailInfo.exposurePerFrame}s × ${info.trailInfo.numFrames} frames  ·  Total: ${info.trailInfo.totalTime}`, 12, h - barH + 36)
    ctx.fillStyle = '#999'
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillText(`Exposure: ${info.trailInfo.totalExposure}`, 12, h - barH + 52)
  }

  ctx.restore()
}

export function StarTrailCalculator() {
  const [mode, setMode] = useState<'sharp' | 'trails'>('trails')
  const canvasHandle = useRef<StarTrailCanvasHandle>(null)
  const exportCanvasRef = useRef<HTMLCanvasElement>(null)
  const [focalLength, setFocalLength] = useState(24)
  const [sensorId, setSensorId] = useState('ff')
  const [resolution, setResolution] = useState(24)
  const [aperture, setAperture] = useState(2.8)
  const [latitude, setLatitude] = useState(45)

  // Trail mode inputs
  const [exposurePerFrame, setExposurePerFrame] = useState(30)
  const [numFrames, setNumFrames] = useState(60)
  const [gap, setGap] = useState(1)
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

  const handleBeforeCopy = useCallback(() => {
    // Draw a static full-progress frame first (captures trails at 100%)
    canvasHandle.current?.drawStatic()

    const src = canvasHandle.current?.canvas
    if (!src) return
    // Create a copy canvas to draw the overlay on (so the live canvas isn't modified)
    if (!exportCanvasRef.current) {
      exportCanvasRef.current = document.createElement('canvas')
    }
    const dest = exportCanvasRef.current
    dest.width = src.width
    dest.height = src.height
    const ctx = dest.getContext('2d')
    if (!ctx) return
    ctx.drawImage(src, 0, 0)

    drawInfoOverlay(dest, {
      mode,
      focalLength,
      sensor: sensor.name,
      aperture,
      latitude,
      resolution,
      sharpResults: mode === 'sharp' ? sharpResults : undefined,
      trailInfo: mode === 'trails' ? {
        exposurePerFrame,
        numFrames,
        totalTime: formatDuration(trailResult),
        totalExposure: formatDuration(totalExposure),
      } : undefined,
    })
  }, [mode, focalLength, sensor.name, aperture, latitude, resolution, sharpResults, exposurePerFrame, numFrames, trailResult, totalExposure])

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
          <ToolActions
            toolName="Star Trail Calculator"
            toolSlug="star-trail-calculator"
            canvasRef={exportCanvasRef}
            imageFilename="star-trail-calculator.png"
            onBeforeCopyImage={handleBeforeCopy}
          />
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
              ref={canvasHandle}
              mode={mode}
              maxExposure500={sharpResults.max500}
              maxExposureNPF={sharpResults.maxNPF}
              totalExposure={totalExposure}
              latitude={latitude}
              exposurePerFrame={exposurePerFrame}
            />
          </div>
        </div>
        <div className={css.desktopOnly}>
          <LearnPanel slug="star-trail-calculator" />
        </div>
      </div>

      {/* Mobile: controls below canvas */}
      <div className={css.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>

      <div className={css.mobileOnly}>
        <LearnPanel slug="star-trail-calculator" />
      </div>
    </div>
  )
}
