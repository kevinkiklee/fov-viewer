'use client'

import { memo } from 'react'
import type { MegapixelPreset, UnitSystem } from '@/lib/types'
import { mpToPixelDimensions } from '@/lib/math/resolution'
import { printSizeMm, qualityTier, fileSizeBytes, type ViewingDistance, type BitDepth, type QualityTier } from '@/lib/math/megapixel'
import { cropReach } from '@/lib/math/resolution'
import { mmToDisplay } from '@/lib/utils/units'
import ss from './MegapixelVisualizer.module.css'

type DpiCol = { value: number }

interface Props {
  mp: MegapixelPreset
  aspect: { w: number; h: number }
  dpis: DpiCol[]
  units: UnitSystem
  viewingDistance: ViewingDistance
  bitDepth: BitDepth
  cropTarget: { id: string; label: string; cropFactor: number } | null
}

function tierClass(tier: QualityTier): string {
  return {
    excellent: ss.qExcellent,
    good: ss.qGood,
    acceptable: ss.qAcceptable,
    soft: ss.qSoft,
  }[tier]
}

function formatMb(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${Math.round(mb)} MB`
}

function tierLabel(tier: QualityTier): string {
  return tier
}

export const PrintTableRow = memo(function PrintTableRow({
  mp, aspect, dpis, units, viewingDistance, bitDepth, cropTarget,
}: Props) {
  const { pxW, pxH } = mpToPixelDimensions(mp.mp, aspect)
  const size = fileSizeBytes(mp.mp, bitDepth)
  const cropped = cropTarget ? cropReach(mp.mp, cropTarget.cropFactor).toFixed(1) : null

  return (
    <tr>
      <th scope="row">{mp.name}</th>
      {dpis.map(d => {
        const { wMm, hMm } = printSizeMm(pxW, pxH, d.value)
        const tier = qualityTier(d.value, viewingDistance)
        const wStr = mmToDisplay(wMm, units).replace(/ (in|cm)$/, '')
        const hStr = mmToDisplay(hMm, units)
        return (
          <td
            key={d.value}
            className={tierClass(tier)}
            data-testid="quality-cell"
            data-tier={tier}
            aria-label={`${wStr} × ${hStr}, ${tierLabel(tier)} quality`}
          >
            {wStr}×{hStr}
          </td>
        )
      })}
      {cropTarget && <td>{cropped} MP</td>}
      <td>{formatMb(size)}</td>
    </tr>
  )
})
