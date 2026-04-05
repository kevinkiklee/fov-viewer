'use client'

import { useTranslations } from 'next-intl'
import { formatDuration } from '@/lib/math/startrail'
import { SENSORS } from '@/lib/data/sensors'
import { ControlPanel, FocalLengthField, FieldRow, NumberStepper, SliderField, controlPanelStyles as cp } from '@/components/shared/ControlPanel'
import { APERTURES } from '@/lib/data/camera'
import { ModeToggle } from '@/components/shared/ModeToggle'
import css from './StarTrailCalculator.module.css'

export function StarTrailControls({
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
  const t = useTranslations('toolUI.star-trail-calculator')
  return (
    <>
      {mode === 'sharp' ? (
        <div key="sharp-results" className={css.modePanel}>
          <div className={css.resultRow}>
            <div className={css.resultCardAccent}>
              <span className={css.resultLabel}>{t('rule500')}</span>
              <span className={css.resultValue}>{sharpResults.max500.toFixed(1)}s</span>
            </div>
            <div className={css.resultCardAccent}>
              <span className={css.resultLabel}>{t('ruleNPF')}</span>
              <span className={css.resultValue}>{sharpResults.maxNPF.toFixed(1)}s</span>
            </div>
          </div>
          <div className={css.resultCard} style={{ marginTop: 12 }}>
            <span className={css.resultLabel}>{t('recommendation')}</span>
            <span className={css.resultNote}>
              {t('recommendationText', { npf: sharpResults.maxNPF.toFixed(1), r500: sharpResults.max500.toFixed(1) })}
            </span>
          </div>
        </div>
      ) : (
        <div key="trails-results" className={css.modePanel}>
          <div className={css.resultRow}>
            <div className={css.resultCardAccent}>
              <span className={css.resultLabel}>{t('shootingTime')}</span>
              <span className={css.resultValue}>{formatDuration(trailResult)}</span>
            </div>
            <div className={css.resultCardAccent}>
              <span className={css.resultLabel}>{t('exposure')}</span>
              <span className={css.resultValue}>
                {formatDuration(exposurePerFrame * numFrames)}
              </span>
            </div>
          </div>
        </div>
      )}

      <ModeToggle
        title={t('displayMode')}
        options={[
          { value: 'trails', label: t('modeStarTrails') },
          { value: 'sharp', label: t('modeSingleShot') },
        ]}
        value={mode}
        onChange={onModeChange}
        sticky
      />

      {mode === 'trails' && (
        <ControlPanel title={t('stacking')} className={css.modePanel}>
          <FieldRow label={t('exposurePerFrame')} description={t('exposurePerFrameDesc')}>
            <NumberStepper value={exposurePerFrame} min={1} max={600} onChange={onExposurePerFrameChange} />
          </FieldRow>

          <FieldRow label={t('frames')} description={t('framesDesc')}>
            <NumberStepper value={numFrames} min={1} max={9999} onChange={onNumFramesChange} />
          </FieldRow>

          <FieldRow label={t('gapSec')} description={t('gapDesc')}>
            <NumberStepper value={gap} min={0} max={60} onChange={onGapChange} />
          </FieldRow>
        </ControlPanel>
      )}

      <ControlPanel title={t('camera')}>
        <FocalLengthField value={focalLength} onChange={onFocalLengthChange} />

        <FieldRow label={t('sensor')}>
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

        <FieldRow label={t('resolutionMP')}>
          <NumberStepper value={resolution} min={1} max={200} onChange={onResolutionChange} />
        </FieldRow>

        <FieldRow label={t('apertureLabel')}>
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

      <ControlPanel title={t('latitude')}>
        <SliderField label={t('position')} value={latitude} min={0} max={90} unit="°" onChange={onLatitudeChange} />
        <button
          className={cp.actionBtn}
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (pos) => onLatitudeChange(Math.round(Math.abs(pos.coords.latitude))),
              () => {},
            )
          }}
        >
          📍 {t('useMyLocation')}
        </button>
      </ControlPanel>
    </>
  )
}
