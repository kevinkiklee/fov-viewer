'use client'

import { useTranslations } from 'next-intl'
import { SENSORS } from '@/lib/data/sensors'
import { FocalLengthField } from '@/components/shared/FocalLengthField'
import { ApertureField } from '@/components/shared/ApertureField'
import { DistanceField } from '@/components/shared/DistanceField'
import { InfoTooltip } from '@/components/shared/InfoTooltip'
import { getSkeletonBySlug } from '@/lib/data/education'
import s from './EquivalentSettings.module.css'

interface SourceSettingsPanelProps {
  focalLength: number
  aperture: number
  distance: number
  sensorId: string
  onFocalLengthChange: (v: number) => void
  onApertureChange: (v: number) => void
  onDistanceChange: (v: number) => void
  onSensorChange: (v: string) => void
}

export function SourceSettingsPanel({
  focalLength, aperture, distance, sensorId,
  onFocalLengthChange, onApertureChange, onDistanceChange, onSensorChange,
}: SourceSettingsPanelProps) {
  const t = useTranslations('toolUI.equivalent-settings-calculator')
  const sensorsT = useTranslations('common.sensors')
  const et = useTranslations('education.equivalent-settings-calculator')
  const skel = getSkeletonBySlug('equivalent-settings-calculator')
  const tooltips = skel
    ? Object.fromEntries(
        skel.tooltipKeys.map((key) => [
          key,
          { term: et(`tooltips.${key}.term`), definition: et(`tooltips.${key}.definition`) },
        ]),
      )
    : undefined

  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{t('sourceCamera')}</h3>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          {t('sourceFocalLength')}
          {tooltips?.sourceFocalLength && <InfoTooltip tooltip={tooltips.sourceFocalLength} />}
        </label>
        <FocalLengthField value={focalLength} onChange={onFocalLengthChange} />
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          {t('sourceAperture')}
          {tooltips?.sourceAperture && <InfoTooltip tooltip={tooltips.sourceAperture} />}
        </label>
        <ApertureField value={aperture} onChange={onApertureChange} />
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>{t('sourceDistance')}</label>
        <DistanceField
          value={distance}
          onChange={onDistanceChange}
          min={0.3}
          max={100}
          label={t('sourceDistance')}
        />
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          {t('sourceSensor')}
          {tooltips?.sourceSensor && <InfoTooltip tooltip={tooltips.sourceSensor} />}
        </label>
        <select
          className={s.select}
          value={sensorId}
          onChange={(e) => onSensorChange(e.target.value)}
        >
          {SENSORS.map((sensor) => (
            <option key={sensor.id} value={sensor.id}>
              {sensorsT.has(sensor.id) ? sensorsT(sensor.id) : sensor.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
