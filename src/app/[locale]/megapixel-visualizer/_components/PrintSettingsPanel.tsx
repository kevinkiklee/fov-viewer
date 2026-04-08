'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ModeToggle } from '@/components/shared/ModeToggle'
import type { ViewingDistance, BitDepth } from '@/lib/math/megapixel'
import ss from './MegapixelVisualizer.module.css'

interface Props {
  dpi: number
  viewingDistance: ViewingDistance
  bitDepth: BitDepth
  onDpiChange: (dpi: number) => void
  onViewingDistanceChange: (d: ViewingDistance) => void
  onBitDepthChange: (b: BitDepth) => void
}

const BASIC_DPIS = [72, 150, 240, 300]
const ADVANCED_DPIS = [360, 600]

export function PrintSettingsPanel({
  dpi,
  viewingDistance,
  bitDepth,
  onDpiChange,
  onViewingDistanceChange,
  onBitDepthChange,
}: Props) {
  const t = useTranslations('toolUI.megapixel-visualizer')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const visibleDpis = showAdvanced ? [...BASIC_DPIS, ...ADVANCED_DPIS] : BASIC_DPIS

  return (
    <>
      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('dpi')}</legend>
        <ModeToggle
          options={visibleDpis.map(v => ({
            value: String(v),
            label: String(v),
          }))}
          value={String(dpi)}
          onChange={(v) => onDpiChange(parseInt(v, 10))}
        />
        <button
          type="button"
          onClick={() => setShowAdvanced(s => !s)}
          className={ss.advancedToggle}
          data-testid="dpi-advanced-toggle"
        >
          {t('advancedDpi')}
        </button>
      </fieldset>

      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('viewingDistance')}</legend>
        <ModeToggle
          options={[
            { value: 'arms', label: t('distanceArms') },
            { value: 'near', label: t('distanceNear') },
            { value: 'far', label: t('distanceFar') },
          ]}
          value={viewingDistance}
          onChange={(v) => onViewingDistanceChange(v as ViewingDistance)}
        />
      </fieldset>

      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('bitDepth')}</legend>
        <ModeToggle
          options={[
            { value: 'jpeg8', label: t('bitDepthJpeg') },
            { value: 'raw14', label: t('bitDepthRaw14') },
            { value: 'tiff16', label: t('bitDepthTiff') },
          ]}
          value={bitDepth}
          onChange={(v) => onBitDepthChange(v as BitDepth)}
        />
      </fieldset>
    </>
  )
}
