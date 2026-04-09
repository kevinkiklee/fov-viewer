'use client'

import { useTranslations } from 'next-intl'
import { DPI_PRESETS } from '@/lib/data/megapixelVisualizer'
import { getAspect } from '@/lib/data/aspectRatios'
import type { MegapixelPreset, UnitSystem } from '@/lib/types'
import type { ViewingDistance, BitDepth } from '@/lib/math/megapixel'
import { PrintTableRow } from './PrintTableRow'
import ss from './MegapixelVisualizer.module.css'

interface Props {
  visibleMps: MegapixelPreset[]
  aspectId: string
  units: UnitSystem
  viewingDistance: ViewingDistance
  bitDepth: BitDepth
}

export function PrintTableView({
  visibleMps, aspectId, units, viewingDistance, bitDepth,
}: Props) {
  const t = useTranslations('toolUI.megapixel-visualizer')
  const aspect = getAspect(aspectId)
  const sorted = [...visibleMps].sort((a, b) => a.mp - b.mp)
  const dpiCols = DPI_PRESETS.slice(0, 4)

  if (sorted.length === 0) {
    return (
      <div className={ss.printTableWrap} data-testid="print-table">
        <p className={ss.emptyState}>{t('emptyStatePrintTable')}</p>
      </div>
    )
  }

  const unitLabel = units === 'imperial' ? 'in' : 'cm'
  return (
    <div className={ss.printTableWrap} data-testid="print-table">
      <table className={ss.printTable}>
        <caption className={ss.visuallyHidden}>
          {t('printTableCaption', { distance: viewingDistance })}
        </caption>
        <thead>
          <tr>
            <th scope="col">{t('tableMegapixels')}</th>
            {dpiCols.map(d => (
              <th key={d.value} scope="col">
                {d.value} DPI
                <span className={ss.unitBadge}>{unitLabel}</span>
              </th>
            ))}
            <th scope="col">{t('tableFileSize')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(mp => (
            <PrintTableRow
              key={mp.id}
              mp={mp}
              aspect={aspect}
              dpis={dpiCols.map(d => ({ value: d.value }))}
              units={units}
              viewingDistance={viewingDistance}
              bitDepth={bitDepth}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
