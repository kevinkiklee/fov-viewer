import type { MegapixelPreset, AspectRatio, UnitSystem, PrintSizePreset } from '@/lib/types'
import { mpToPixelDimensions } from '@/lib/math/resolution'
import { qualityTier, type ViewingDistance } from '@/lib/math/megapixel'
import { layoutPaperSheet, drawPaperSheet } from './drawPaperSheet'

export function drawPrintPreset(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
  visibleMps: MegapixelPreset[],
  aspect: AspectRatio,
  paper: PrintSizePreset,
  orientation: 'landscape' | 'portrait',
  fitMode: 'crop' | 'fit',
  _dpi: number,
  viewingDistance: ViewingDistance,
  _units: UnitSystem,
): { contentHeight: number; pxPerMm: number } {
  const layout = layoutPaperSheet(canvasWidth, canvasHeight, padding, paper, orientation, aspect, fitMode)

  drawPaperSheet(ctx, layout)

  // Quality badges for each visible MP at this paper size + DPI
  // Compute pxW for each MP → print size at target dpi
  // Compare to paper dimensions → determine effective DPI → quality tier
  ctx.save()
  ctx.font = '12px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  let labelY = layout.paperY + 20
  const labelX = layout.paperX + layout.paperW + 20
  for (const mp of visibleMps) {
    const { pxW } = mpToPixelDimensions(mp.mp, aspect)
    const paperWmm =
      orientation === 'landscape' ? Math.max(paper.wMm, paper.hMm) : Math.min(paper.wMm, paper.hMm)
    const effectiveDpi = pxW / (paperWmm / 25.4)
    const tier = qualityTier(effectiveDpi, viewingDistance)
    const badge = tier === 'excellent' || tier === 'good' ? '✓' : tier === 'acceptable' ? '!' : '✕'

    ctx.fillStyle = mp.color
    ctx.fillText(`${badge} ${mp.name} — ${tier}`, labelX, labelY)
    labelY += 20
  }
  ctx.restore()

  // Crop or margin warning below paper
  ctx.save()
  ctx.font = '11px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fbbf24'
  if (layout.cropPercent > 0 && fitMode === 'crop') {
    ctx.fillText(
      `⚠ ${layout.cropPercent}% cropped`,
      layout.paperX + layout.paperW / 2,
      layout.paperY + layout.paperH + 20,
    )
  } else if (layout.marginPercent > 0 && fitMode === 'fit') {
    ctx.fillText(
      `${layout.marginPercent}% margin`,
      layout.paperX + layout.paperW / 2,
      layout.paperY + layout.paperH + 20,
    )
  }
  ctx.restore()

  const contentHeight = Math.max(500, layout.paperY + layout.paperH + 60)
  return { contentHeight, pxPerMm: layout.pxPerMm }
}
