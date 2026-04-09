import type { MegapixelPreset, UnitSystem, AspectRatio } from '@/lib/types'
import { mpToPixelDimensions } from '@/lib/math/resolution'
import { printSizeMm } from '@/lib/math/megapixel'
import { drawRect, rgba, roundRect } from './drawHelpers'

export type OverlayRect = { id: string; x: number; y: number; w: number; h: number }
export let overlayRects: OverlayRect[] = []

export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
  visibleMps: MegapixelPreset[],
  aspect: AspectRatio,
  dpi: number,
  _units: UnitSystem,
  hoveredId: string | null,
): { contentHeight: number; pxPerMm: number } {
  overlayRects = []
  if (visibleMps.length === 0) {
    return { contentHeight: 300, pxPerMm: 0 }
  }

  // Compute print size in mm for each MP
  const sized = visibleMps
    .map(m => {
      const { pxW, pxH } = mpToPixelDimensions(m.mp, aspect)
      const { wMm, hMm } = printSizeMm(pxW, pxH, dpi)
      return { mp: m, wMm, hMm }
    })
    .sort((a, b) => b.wMm * b.hMm - (a.wMm * a.hMm))

  const maxWMm = sized[0].wMm
  const maxHMm = sized[0].hMm

  const isMobile = canvasWidth < 600
  const labelColumnW = isMobile ? 0 : 110
  const scaleBarReserve = 40

  // Fit-to-viewport (centered in remaining area, with label column reserved on the left desktop only)
  const availW = canvasWidth - padding * 2 - labelColumnW
  const availH = canvasHeight - padding * 2 - scaleBarReserve

  const pxPerMm = Math.min(availW / maxWMm, availH / maxHMm)
  const rectsW = maxWMm * pxPerMm
  const rectsH = maxHMm * pxPerMm

  const cx = padding + labelColumnW + (canvasWidth - padding * 2 - labelColumnW) / 2
  const cy = padding + (canvasHeight - padding * 2 - scaleBarReserve) / 2

  // Draw rectangles from largest (back) to smallest (front)
  for (const { mp, wMm, hMm } of sized) {
    const w = wMm * pxPerMm
    const h = hMm * pxPerMm
    const x = cx - w / 2
    const y = cy - h / 2

    const alpha = hoveredId && hoveredId !== mp.id ? 0.3 : 1
    drawRect(ctx, x, y, w, h, mp.color, alpha)

    overlayRects.push({ id: mp.id, x, y, w, h })
  }

  // Labels: pills in a column to the left of the largest rectangle, with leader lines
  if (isMobile) {
    drawOverlayMobileLabels(ctx, sized, hoveredId, cx, cy, rectsH, padding)
  } else {
    drawOverlayDesktopLabels(ctx, sized, hoveredId, cx, cy, pxPerMm, rectsW)
  }

  const contentHeight = Math.max(rectsH + padding * 2 + scaleBarReserve, 400)
  return { contentHeight, pxPerMm }
}

interface SizedMp { mp: MegapixelPreset; wMm: number; hMm: number }

function drawOverlayDesktopLabels(
  ctx: CanvasRenderingContext2D,
  sorted: SizedMp[],
  hoveredId: string | null,
  cx: number, cy: number, pxPerMm: number, rectsW: number,
) {
  const pillH = 18
  const labelGap = 4
  const totalH = sorted.length * pillH + (sorted.length - 1) * labelGap
  const largestRectLeft = cx - rectsW / 2
  const columnRight = largestRectLeft - 20

  ctx.font = '11px system-ui, sans-serif'
  const pillWidths = sorted.map(s => ctx.measureText(s.mp.name).width + 12)

  let labelY = cy - totalH / 2
  for (let i = 0; i < sorted.length; i++) {
    const { mp, hMm } = sorted[i]
    const alpha = hoveredId && hoveredId !== mp.id ? 0.3 : 1
    const pillW = pillWidths[i]
    const pillX = columnRight - pillW
    const pillCenterY = labelY + pillH / 2

    // Each rectangle's edge is at cx - (wMm * pxPerMm) / 2
    const rectLeft = cx - sorted[i].wMm * pxPerMm / 2
    // Draw leader line to whichever is further right (the rect or the largest)
    const lineEndX = rectLeft
    // Vertical position on the rectangle edge (clamped to rect bounds)
    const rectTop = cy - hMm * pxPerMm / 2
    const rectBottom = cy + hMm * pxPerMm / 2
    const lineEndY = Math.max(rectTop + 3, Math.min(rectBottom - 3, pillCenterY))

    ctx.save()
    ctx.globalAlpha = alpha

    // Dashed leader line
    ctx.beginPath()
    ctx.moveTo(columnRight + 4, pillCenterY)
    ctx.lineTo(lineEndX - 4, pillCenterY)
    if (lineEndY !== pillCenterY) {
      ctx.lineTo(lineEndX - 4, lineEndY)
      ctx.lineTo(lineEndX, lineEndY)
    } else {
      ctx.lineTo(lineEndX, lineEndY)
    }
    ctx.strokeStyle = rgba(mp.color, 0.3)
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    ctx.stroke()
    ctx.setLineDash([])

    // Connector dot
    ctx.beginPath()
    ctx.arc(lineEndX, lineEndY, 2, 0, Math.PI * 2)
    ctx.fillStyle = rgba(mp.color, 0.6)
    ctx.fill()

    // Pill background
    roundRect(ctx, pillX, labelY, pillW, pillH, 4)
    ctx.fillStyle = rgba(mp.color, 0.18)
    ctx.fill()

    // Label text
    ctx.fillStyle = mp.color
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(mp.name, pillX + 6, pillCenterY)

    ctx.restore()
    labelY += pillH + labelGap
  }
}

function drawOverlayMobileLabels(
  ctx: CanvasRenderingContext2D,
  sorted: SizedMp[],
  hoveredId: string | null,
  cx: number, cy: number, rectsH: number, _padding: number,
) {
  const pillH = 18
  const labelGap = 4

  ctx.font = '11px system-ui, sans-serif'
  const pillWidths = sorted.map(s => ctx.measureText(s.mp.name).width + 12)

  let labelY = cy + rectsH / 2 + 16
  for (let i = 0; i < sorted.length; i++) {
    const { mp } = sorted[i]
    const alpha = hoveredId && hoveredId !== mp.id ? 0.3 : 1
    const pillW = pillWidths[i]
    const pillX = cx - pillW / 2

    ctx.save()
    ctx.globalAlpha = alpha

    roundRect(ctx, pillX, labelY, pillW, pillH, 4)
    ctx.fillStyle = rgba(mp.color, 0.18)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(pillX - 8, labelY + pillH / 2, 3, 0, Math.PI * 2)
    ctx.fillStyle = mp.color
    ctx.fill()

    ctx.fillStyle = mp.color
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(mp.name, pillX + 6, labelY + pillH / 2)

    ctx.restore()
    labelY += pillH + labelGap
  }
}
