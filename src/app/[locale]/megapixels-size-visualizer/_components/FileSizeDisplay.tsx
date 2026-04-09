'use client'

import { useTranslations } from 'next-intl'
import { fileSizeBytes } from '@/lib/math/megapixel'
import type { MegapixelPreset } from '@/lib/types'
import ss from './MegapixelVisualizer.module.css'

interface Props {
  visibleMps: MegapixelPreset[]
  hoveredMpId: string | null
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${Math.round(mb)} MB`
}

export function FileSizeDisplay({ visibleMps, hoveredMpId }: Props) {
  const t = useTranslations('toolUI.megapixel-visualizer')

  const target = (hoveredMpId && visibleMps.find(m => m.id === hoveredMpId))
    ?? visibleMps[0]

  if (!target) return null

  const jpeg = fileSizeBytes(target.mp, 'jpeg8')
  const raw = fileSizeBytes(target.mp, 'raw14')
  const tiff = fileSizeBytes(target.mp, 'tiff16')

  return (
    <div className={ss.fileSizeRow} data-testid="file-size-display">
      <span className={ss.fileSizeLabel}>{target.name}</span>
      <span className={ss.fileSizeItem}>
        {t('fileSizeJpeg')} ≈ {formatBytes(jpeg)}
      </span>
      <span className={ss.fileSizeItem}>
        {t('fileSizeRaw')} ≈ {formatBytes(raw)}
      </span>
      <span className={ss.fileSizeItem}>
        {t('fileSizeTiff')} ≈ {formatBytes(tiff)}
      </span>
    </div>
  )
}
