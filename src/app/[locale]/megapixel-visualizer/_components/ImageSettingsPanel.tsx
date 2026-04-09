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
        <div className={ss.aspectGrid}>
          {ASPECT_RATIOS.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => onAspectChange(a.id)}
              className={`${ss.aspectBtn} ${aspectId === a.id ? ss.aspectBtnActive : ''}`}
              aria-pressed={aspectId === a.id}
            >
              {a.label}
            </button>
          ))}
        </div>
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
