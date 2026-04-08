'use client'

import { useTranslations } from 'next-intl'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { ASPECT_RATIOS } from '@/lib/data/aspectRatios'
import type { UnitSystem } from '@/lib/types'
import ss from './MegapixelVisualizer.module.css'

interface Props {
  aspectId: string
  units: UnitSystem
  onAspectChange: (id: string) => void
  onUnitsChange: (u: UnitSystem) => void
}

export function ImageSettingsPanel({
  aspectId,
  units,
  onAspectChange,
  onUnitsChange,
}: Props) {
  const t = useTranslations('toolUI.megapixel-visualizer')

  return (
    <>
      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('aspectRatio')}</legend>
        <ModeToggle
          options={ASPECT_RATIOS.map(a => ({ value: a.id, label: a.label }))}
          value={aspectId}
          onChange={onAspectChange}
        />
      </fieldset>

      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('units')}</legend>
        <ModeToggle
          options={[
            { value: 'metric', label: t('unitsMetric') },
            { value: 'imperial', label: t('unitsImperial') },
          ]}
          value={units}
          onChange={(v) => onUnitsChange(v as UnitSystem)}
        />
      </fieldset>
    </>
  )
}
