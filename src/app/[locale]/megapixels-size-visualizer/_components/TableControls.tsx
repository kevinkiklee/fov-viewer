'use client'

import { useTranslations } from 'next-intl'
import type { PrintTableControlsProps } from './megapixelTypes'
import type { ViewingDistance, BitDepth } from '@/lib/math/megapixel'
import ss from './MegapixelVisualizer.module.css'

export function TableControls({
  viewingDistance,
  bitDepth,
  onViewingDistanceChange,
  onBitDepthChange,
}: PrintTableControlsProps) {
  const t = useTranslations('toolUI.megapixels-size-visualizer')

  const distanceOptions: { value: ViewingDistance; label: string }[] = [
    { value: 'arms', label: t('distanceArms') },
    { value: 'near', label: t('distanceNear') },
    { value: 'far',  label: t('distanceFar') },
  ]

  const bitDepthOptions: { value: BitDepth; label: string }[] = [
    { value: 'jpeg8',  label: t('bitDepthJpeg') },
    { value: 'raw14',  label: t('bitDepthRaw14') },
    { value: 'tiff16', label: t('bitDepthTiff') },
  ]

  return (
    <div className={ss.tableControls}>
      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('viewingDistance')}</legend>
        <div className={ss.segmentedGroup}>
          {distanceOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onViewingDistanceChange(opt.value)}
              className={`${ss.segmentedBtn} ${viewingDistance === opt.value ? ss.segmentedBtnActive : ''}`}
              aria-pressed={viewingDistance === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('bitDepth')}</legend>
        <div className={ss.segmentedGroup}>
          {bitDepthOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onBitDepthChange(opt.value)}
              className={`${ss.segmentedBtn} ${bitDepth === opt.value ? ss.segmentedBtnActive : ''}`}
              aria-pressed={bitDepth === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
