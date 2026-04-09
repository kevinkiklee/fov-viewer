'use client'

import { memo } from 'react'
import type { MegapixelPreset, UnitSystem } from '@/lib/types'
import { mpToPixelDimensions } from '@/lib/math/resolution'
import { printSizeMm, qualityTier, fileSizeBytes, type ViewingDistance, type BitDepth, type QualityTier } from '@/lib/math/megapixel'
import ss from './MegapixelVisualizer.module.css'

type DpiCol = { value: number }

interface Props {
  mp: MegapixelPreset
  aspect: { w: number; h: number }
  dpis: DpiCol[]
  units: UnitSystem
  viewingDistance: ViewingDistance
  bitDepth: BitDepth
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

/** Format a mm measurement as an integer in the target unit, no suffix. */
function formatSize(mm: number, units: UnitSystem): string {
  const value = units === 'imperial' ? mm / 25.4 : mm / 10
  return Math.round(value).toString()
}

export const PrintTableRow = memo(function PrintTableRow({
  mp, aspect, dpis, units, viewingDistance, bitDepth,
}: Props) {
  const { pxW, pxH } = mpToPixelDimensions(mp.mp, aspect)
  const size = fileSizeBytes(mp.mp, bitDepth)
  const unitLabel = units === 'imperial' ? 'in' : 'cm'

  return (
    <tr>
      <th scope="row">{mp.name}</th>
      {dpis.map(d => {
        const { wMm, hMm } = printSizeMm(pxW, pxH, d.value)
        const tier = qualityTier(d.value, viewingDistance)
        const wStr = formatSize(wMm, units)
        const hStr = formatSize(hMm, units)
        return (
          <td
            key={d.value}
            className={tierClass(tier)}
            data-testid="quality-cell"
            data-tier={tier}
            aria-label={`${wStr}×${hStr} ${unitLabel}, ${tierLabel(tier)} quality`}
          >
            {wStr}×{hStr}
          </td>
        )
      })}
      <td>{formatMb(size)}</td>
    </tr>
  )
})
