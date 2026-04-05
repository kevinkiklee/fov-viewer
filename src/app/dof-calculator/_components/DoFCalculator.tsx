'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { calcDoF } from '@/lib/math/dof'
import { SENSORS } from '@/lib/data/sensors'
import { useQueryInit, useToolQuerySync, intParam, numParam, strParam, sensorParam } from '@/lib/utils/querySync'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import { DoFDiagram } from '@/components/shared/DoFDiagram'
import { DoFCanvas } from '@/components/shared/DoFCanvas'
import type { SceneKey } from '@/components/shared/DoFCanvas'
import { distanceToSlider, sliderToDistance } from './dof-helpers'
import { DOF_SCENE_PRESETS } from '@/lib/data/dofCalculator'
import { DoFSettingsPanel } from './DoFSettingsPanel'
import { DoFResultsPanel } from './DoFResultsPanel'
import s from './DoFCalculator.module.css'

const PARAM_SCHEMA = {
  fl: intParam(50, 8, 800),
  f: numParam(2.8, 1.4, 22),
  d: numParam(3, 0.3, 100),
  s: sensorParam('ff'),
  scene: strParam<SceneKey>('portrait', ['portrait', 'landscape', 'street', 'macro']),
}

export function DoFCalculator() {
  const t = useTranslations('toolUI.dof-calculator')
  const [focalLength, setFocalLength] = useState(50)
  const [aperture, setAperture] = useState(2.8)
  const [sliderVal, setSliderVal] = useState(distanceToSlider(3))
  const [sensorId, setSensorId] = useState('ff')
  const [scene, setScene] = useState<SceneKey>('portrait')
  useQueryInit(PARAM_SCHEMA, { fl: setFocalLength, f: setAperture, d: (v: number) => setSliderVal(distanceToSlider(v)), s: setSensorId, scene: setScene })

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
    focalLength, aperture, sliderVal, sensorId, distance,
    onFocalLengthChange: setFocalLength, onApertureChange: setAperture,
    onSliderChange: setSliderVal, onSensorChange: setSensorId,
  }

  const resultsProps = {
    nearFocus: result.nearFocus, farFocus: result.farFocus,
    totalDoF: result.totalDoF, hyperfocal: result.hyperfocal,
  }

  return (
    <div className={s.app}>
      <div className={s.appBody}>
        <div className={s.sidebar}>
          <ToolActions toolName="Depth of Field Calculator" toolSlug="dof-calculator" />
          <DoFSettingsPanel {...settingsProps} />
          <DoFResultsPanel {...resultsProps} />
        </div>

        <div className={s.canvasArea}>
          <div className={s.canvasTopbar}>
            <span className={s.presetLabel}>{t('scene')}</span>
            {DOF_SCENE_PRESETS.map((preset) => (
              <button key={preset.key}
                className={`${s.presetBtn} ${scene === preset.key ? s.presetBtnActive : ''}`}
                onClick={() => setScene(preset.key)} aria-pressed={scene === preset.key}>
                {t(preset.labelKey)}
              </button>
            ))}
          </div>
          <div className={s.canvasMain}>
            <DoFCanvas focusDistance={focusNormalized} aperture={aperture} scene={scene} className={s.canvas} />
          </div>
          <div className={s.depthBar}>
            <DoFDiagram result={result} distance={distance} onDistanceChange={handleDiagramDistanceChange} />
          </div>
        </div>
        <div className={s.desktopOnly}>
          <LearnPanel slug="dof-calculator" />
        </div>
      </div>

      <div className={s.mobileControls}>
        <DoFSettingsPanel {...settingsProps} />
        <DoFResultsPanel {...resultsProps} />
      </div>

      <div className={s.mobileOnly}>
        <LearnPanel slug="dof-calculator" />
      </div>
    </div>
  )
}
