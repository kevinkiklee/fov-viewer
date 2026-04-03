'use client'

import { useState, useMemo } from 'react'
import { pixelPitch, diffractionLimitedAperture } from '@/lib/math/diffraction'
import { SENSORS } from '@/lib/data/sensors'
import { useQueryInit, useToolQuerySync, intParam, numParam, strParam, sensorParam } from '@/lib/utils/querySync'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import { DiffractionCanvas, type DetailType } from './DiffractionCanvas'
import css from './DiffractionLimit.module.css'

/** Derive sensor width from crop factor (FF = 36mm) */
function sensorWidth(cropFactor: number): number {
  return 36 / cropFactor
}

const DETAIL_PRESETS: { id: DetailType; label: string }[] = [
  { id: 'text', label: 'Text' },
  { id: 'foliage', label: 'Foliage' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'fabric', label: 'Fabric' },
]

// Aperture slider range: f/2.8 to f/22 (continuous, log-mapped)
const MIN_F = 2.8
const MAX_F = 22
const MIN_LOG = Math.log(MIN_F)
const MAX_LOG = Math.log(MAX_F)

function sliderToAperture(value: number): number {
  // value 0..100 -> log-mapped aperture
  const logF = MIN_LOG + (value / 100) * (MAX_LOG - MIN_LOG)
  return Math.exp(logF)
}

function apertureToSlider(aperture: number): number {
  const logF = Math.log(Math.max(MIN_F, Math.min(MAX_F, aperture)))
  return ((logF - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 100
}

const PARAM_SCHEMA = {
  s: sensorParam('ff'),
  mp: intParam(24, 1, 200),
  ap: numParam(apertureToSlider(8), 0, 100),
  dt: strParam<DetailType>('text', ['text', 'foliage', 'architecture', 'fabric']),
}

function sharpnessAssessment(currentAperture: number, limitAperture: number) {
  if (currentAperture <= limitAperture) {
    return { label: 'Sharp — below diffraction limit', className: css.assessmentSharp }
  }
  const stopsOver = Math.log2(currentAperture / limitAperture)
  if (stopsOver < 1.5) {
    return { label: 'Slightly softened by diffraction', className: css.assessmentSoft }
  }
  return { label: 'Significantly softened by diffraction', className: css.assessmentVSoft }
}

function ControlsPanel({
  sensorId,
  resolution,
  apertureSlider,
  currentAperture,
  pitch,
  limitAperture,
  airyDisk,
  onSensorChange,
  onResolutionChange,
  onApertureChange,
}: {
  sensorId: string
  resolution: number
  apertureSlider: number
  currentAperture: number
  pitch: number
  limitAperture: number
  airyDisk: number
  onSensorChange: (id: string) => void
  onResolutionChange: (mp: number) => void
  onApertureChange: (slider: number) => void
}) {
  const assessment = sharpnessAssessment(currentAperture, limitAperture)

  return (
    <>
      <div className={css.sidebarHeader}>
        <h2 className={css.sidebarTitle}>Diffraction Limit</h2>
        <p className={css.sidebarDesc}>
          Find the sharpest aperture before diffraction softening.
        </p>
      </div>

      <div className={css.settingsPanel}>
        <div className={css.field}>
          <label className={css.fieldLabel}>Sensor</label>
          <select
            className={css.select}
            value={sensorId}
            onChange={(e) => onSensorChange(e.target.value)}
          >
            {SENSORS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({sensorWidth(s.cropFactor).toFixed(1)}mm)
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
          <label className={css.fieldLabel}>
            Aperture: <span className={css.fieldValue}>f/{currentAperture.toFixed(1)}</span>
          </label>
          <input
            type="range"
            className={css.slider}
            min={0}
            max={100}
            step={0.5}
            value={apertureSlider}
            onChange={(e) => onApertureChange(Number(e.target.value))}
          />
        </div>
      </div>

      <div className={css.resultsPanel}>
        <div className={css.resultCard}>
          <span className={css.resultLabel}>Pixel Pitch</span>
          <span className={css.resultSmall}>{pitch.toFixed(2)} um</span>
        </div>
        <div className={css.resultCard}>
          <span className={css.resultLabel}>Diffraction Limit</span>
          <span className={css.resultValue}>f/{limitAperture.toFixed(1)}</span>
        </div>
        <div className={css.resultCard}>
          <span className={css.resultLabel}>Airy Disk Diameter</span>
          <span className={css.resultSmall}>{airyDisk.toFixed(2)} um</span>
        </div>
        <div className={css.resultCard}>
          <span className={css.resultLabel}>Sharpness</span>
          <span className={`${css.assessment} ${assessment.className}`}>
            {assessment.label}
          </span>
        </div>
      </div>
    </>
  )
}

export function DiffractionLimit() {
  const [sensorId, setSensorId] = useState('ff')
  const [resolution, setResolution] = useState(24)
  const [apertureSlider, setApertureSlider] = useState(apertureToSlider(8))
  const [detailType, setDetailType] = useState<DetailType>('text')
  useQueryInit(PARAM_SCHEMA, { s: setSensorId, mp: setResolution, ap: setApertureSlider, dt: setDetailType })

  useToolQuerySync({ s: sensorId, mp: resolution, ap: apertureSlider, dt: detailType }, PARAM_SCHEMA)

  const sensor = SENSORS.find((s) => s.id === sensorId) ?? SENSORS[1]
  const width = sensorWidth(sensor.cropFactor)
  const currentAperture = sliderToAperture(apertureSlider)

  const { pitch, limitAperture } = useMemo(() => {
    const p = pixelPitch(width, resolution)
    const a = diffractionLimitedAperture(p)
    return { pitch: p, limitAperture: a }
  }, [width, resolution])

  const airyDisk = 2.44 * 0.55 * currentAperture // µm, green light 550nm

  const controlsProps = {
    sensorId,
    resolution,
    apertureSlider,
    currentAperture,
    pitch,
    limitAperture,
    airyDisk,
    onSensorChange: setSensorId,
    onResolutionChange: setResolution,
    onApertureChange: setApertureSlider,
  }

  return (
    <div className={css.app}>
      <div className={css.appBody}>
        <div className={css.sidebar}>
          <ToolActions toolName="Diffraction Limit Calculator" toolSlug="diffraction-limit" />
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={css.canvasArea}>
          <div className={css.topbar}>
            <span className={css.presetStripLabel}>Detail:</span>
            <div className={css.presetStrip}>
              {DETAIL_PRESETS.map((p) => (
                <button
                  key={p.id}
                  className={`${css.presetBtn} ${detailType === p.id ? css.presetBtnActive : ''}`}
                  onClick={() => setDetailType(p.id)}
                  aria-pressed={detailType === p.id}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className={css.canvasMain}>
            <DiffractionCanvas
              pixelPitchUm={pitch}
              limitAperture={limitAperture}
              currentAperture={currentAperture}
              detailType={detailType}
            />
          </div>
        </div>
        <LearnPanel slug="diffraction-limit" />
      </div>

      {/* Mobile: controls below canvas */}
      <div className={css.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>
    </div>
  )
}
