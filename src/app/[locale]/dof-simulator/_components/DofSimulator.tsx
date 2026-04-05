'use client'

import { useState, useMemo } from 'react'
import {
  calcDoF, calcBackgroundBlur, calcAiryDisk,
  calcOptimalAperture, calcIsolationScore,
} from '@/lib/math/dof'
import { SENSORS } from '@/lib/data/sensors'
import {
  getDofScene,
  type SubjectMode, type ABMode, type BokehShape,
} from '@/lib/data/dofSimulator'
import { useQueryInit, useToolQuerySync } from '@/lib/utils/querySync'
import { PARAM_SCHEMA } from './querySync'
import { DofSettingsPanel } from './DofSettingsPanel'
import { DofResultsPanel } from './DofResultsPanel'
import { FramingPanel } from './FramingPanel'
import { BokehPanel } from './BokehPanel'
import { DofToolbar } from './DofToolbar'
import { DofViewport } from './DofViewport'
import { DofDiagramBar } from './DofDiagramBar'
import { BlurProfileGraph } from './BlurProfileGraph'
import { ABComparison } from './ABComparison'
import { SubjectFigure } from './SubjectFigure'
import { FocusTarget } from './FocusTarget'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import { ModeToggle } from '@/components/shared/ModeToggle'
import s from './DofSimulator.module.css'

export function DofSimulator() {
  // ── Camera settings (A set) ──
  const [focalLength, setFocalLength] = useState(85)
  const [aperture, setAperture] = useState(2.8)
  const [subjectDistance, setSubjectDistance] = useState(3)
  const [sensorId, setSensorId] = useState('ff')
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')

  // ── Scene & modes ──
  const [sceneKey, setSceneKey] = useState('park-portrait')
  const [subjectMode, setSubjectMode] = useState<SubjectMode>('figure')
  const [abMode, setAbMode] = useState<ABMode>('off')
  const [bokehShape, setBokehShape] = useState<BokehShape>('disc')
  const [useDiffraction, setUseDiffraction] = useState(false)

  // ── A/B settings (B set) ──
  const [bFocalLength, setBFocalLength] = useState(50)
  const [bAperture, setBAperture] = useState(5.6)
  const [bSubjectDistance, setBSubjectDistance] = useState(3)
  const [bSensorId, setBSensorId] = useState('ff')

  // ── A/B state ──
  const [activeSet, setActiveSet] = useState<'a' | 'b'>('a')
  const [dividerPos, setDividerPos] = useState(0.5)

  // ── Framing ──
  const [activeFramingPreset, setActiveFramingPreset] = useState<string | null>(null)
  const [framingLockMode, setFramingLockMode] = useState<'constantFL' | 'constantDistance'>('constantFL')

  // ── Query sync ──
  useQueryInit(PARAM_SCHEMA, {
    fl: setFocalLength, f: setAperture, d: setSubjectDistance,
    s: setSensorId, scene: setSceneKey, mode: setSubjectMode,
    orient: setOrientation, bokeh: setBokehShape, ab: setAbMode,
    b_fl: setBFocalLength, b_f: setBAperture,
    b_d: setBSubjectDistance, b_s: setBSensorId,
  })
  useToolQuerySync({
    fl: focalLength, f: aperture, d: subjectDistance,
    s: sensorId, scene: sceneKey, mode: subjectMode,
    orient: orientation, bokeh: bokehShape, ab: abMode,
    b_fl: bFocalLength, b_f: bAperture,
    b_d: bSubjectDistance, b_s: bSensorId,
  }, PARAM_SCHEMA)

  // ── Computed: sensor A ──
  const sensor = SENSORS.find((sen) => sen.id === sensorId) ?? SENSORS[3]
  const sensorWidth = orientation === 'landscape' ? sensor.w : sensor.h
  const sensorHeight = orientation === 'landscape' ? sensor.h : sensor.w
  const coc = 0.03 / sensor.cropFactor
  const scene = getDofScene(sceneKey)

  // ── Computed: sensor B ──
  const bSensor = SENSORS.find((sen) => sen.id === bSensorId) ?? SENSORS[3]
  const bSensorWidth = orientation === 'landscape' ? bSensor.w : bSensor.h

  // ── Computed: DoF results (A) ──
  const dofResult = useMemo(
    () => calcDoF({ focalLength, aperture, distance: subjectDistance, coc }),
    [focalLength, aperture, subjectDistance, coc],
  )

  const backgroundBlurMm = useMemo(
    () => calcBackgroundBlur({ focalLength, aperture, subjectDistance, targetDistance: scene.farDistance }),
    [focalLength, aperture, subjectDistance, scene.farDistance],
  )

  const backgroundBlurPct = (backgroundBlurMm / sensorWidth) * 100

  const isolationScore = useMemo(
    () => calcIsolationScore(backgroundBlurMm, coc),
    [backgroundBlurMm, coc],
  )

  const sweetSpot = useMemo(
    () => calcOptimalAperture(focalLength, subjectDistance, scene.farDistance),
    [focalLength, subjectDistance, scene.farDistance],
  )

  const isDiffractionLimited = calcAiryDisk(aperture) > backgroundBlurMm

  // ── Prop bundles ──
  const settingsProps = {
    focalLength, aperture, subjectDistance, sensorId,
    orientation, sweetSpot,
    onFocalLengthChange: setFocalLength, onApertureChange: setAperture,
    onDistanceChange: setSubjectDistance, onSensorChange: setSensorId,
    onOrientationChange: setOrientation,
  }

  const resultsProps = {
    nearFocus: dofResult.nearFocus, farFocus: dofResult.farFocus,
    totalDoF: dofResult.totalDoF, hyperfocal: dofResult.hyperfocal,
    backgroundBlurMm, backgroundBlurPct, coc,
    isolationScore, isDiffractionLimited,
  }

  const abSetOptions = [
    { value: 'a' as const, label: 'A' },
    { value: 'b' as const, label: 'B' },
  ]

  const isInFocus = subjectDistance >= dofResult.nearFocus && subjectDistance <= dofResult.farFocus

  return (
    <div className={s.app}>
      <div className={s.appBody}>
        {/* ── Sidebar ── */}
        <div className={s.sidebar}>
          <ToolActions toolSlug="dof-simulator" />

          {abMode !== 'off' && (
            <ModeToggle options={abSetOptions} value={activeSet} onChange={setActiveSet} />
          )}

          {activeSet === 'a' || abMode === 'off' ? (
            <DofSettingsPanel {...settingsProps} />
          ) : (
            <DofSettingsPanel
              focalLength={bFocalLength} aperture={bAperture}
              subjectDistance={bSubjectDistance} sensorId={bSensorId}
              orientation={orientation} sweetSpot={null}
              onFocalLengthChange={setBFocalLength} onApertureChange={setBAperture}
              onDistanceChange={setBSubjectDistance} onSensorChange={setBSensorId}
              onOrientationChange={setOrientation}
            />
          )}

          <FramingPanel
            activePreset={activeFramingPreset}
            lockMode={framingLockMode}
            onPresetClick={setActiveFramingPreset}
            onLockModeChange={setFramingLockMode}
          />

          <BokehPanel
            bokehShape={bokehShape}
            useDiffraction={useDiffraction}
            onBokehShapeChange={setBokehShape}
            onDiffractionChange={setUseDiffraction}
          />

          <DofResultsPanel {...resultsProps} />
        </div>

        {/* ── Center ── */}
        <div className={s.canvasArea}>
          <DofToolbar
            sceneKey={sceneKey}
            onSceneChange={setSceneKey}
            subjectMode={subjectMode}
            onSubjectModeChange={setSubjectMode}
            abMode={abMode}
            onABModeChange={setAbMode}
            blurPct={backgroundBlurPct}
          />

          <div className={s.canvasMain}>
            <ABComparison
              mode={abMode}
              dividerPosition={dividerPos}
              onDividerChange={setDividerPos}
              settingsLabelA={`A: f/${aperture} \u00b7 ${focalLength}mm`}
              settingsLabelB={`B: f/${bAperture} \u00b7 ${bFocalLength}mm`}
              viewportA={
                <DofViewport
                  scene={scene} focalLength={focalLength} aperture={aperture}
                  subjectDistance={subjectDistance} sensorWidth={sensorWidth}
                  useDiffraction={useDiffraction}
                />
              }
              viewportB={
                <DofViewport
                  scene={scene} focalLength={bFocalLength} aperture={bAperture}
                  subjectDistance={bSubjectDistance} sensorWidth={bSensorWidth}
                  useDiffraction={useDiffraction}
                />
              }
            />

            {subjectMode === 'figure' && (
              <SubjectFigure
                subjectDistance={subjectDistance}
                focalLength={focalLength}
                sensorHeight={sensorHeight}
                viewportHeight={400}
                focalResult={{ nearFocus: dofResult.nearFocus, farFocus: dofResult.farFocus }}
              />
            )}
            {subjectMode === 'target' && (
              <FocusTarget isInFocus={isInFocus} distance={subjectDistance} />
            )}
          </div>

          <DofDiagramBar
            distance={subjectDistance}
            nearFocus={dofResult.nearFocus}
            farFocus={dofResult.farFocus}
            onDistanceChange={setSubjectDistance}
          />

          <BlurProfileGraph
            focalLength={focalLength}
            aperture={aperture}
            subjectDistance={subjectDistance}
            coc={coc}
            sensorWidth={sensorWidth}
          />
        </div>

        {/* ── LearnPanel (desktop) ── */}
        <div className={s.desktopOnly}>
          <LearnPanel slug="dof-simulator" />
        </div>
      </div>

      {/* ── Mobile controls ── */}
      <div className={s.mobileControls}>
        <DofSettingsPanel {...settingsProps} />
        <DofResultsPanel {...resultsProps} />
      </div>

      <div className={s.mobileOnly}>
        <LearnPanel slug="dof-simulator" />
      </div>
    </div>
  )
}
