import type { UnitSystem } from '@/lib/types'

const MM_PER_INCH = 25.4

export function drawScaleBar(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  pxPerMm: number,
  units: UnitSystem,
) {
  if (pxPerMm <= 0) return

  const targetPx = canvasWidth * 0.15
  const mmRaw = targetPx / pxPerMm
  const unit = units === 'imperial' ? MM_PER_INCH : 10
  const valueInUnit = mmRaw / unit
  const rounded = roundToNice(valueInUnit)
  const actualPx = rounded * unit * pxPerMm

  const x = 20
  const y = canvasHeight - 20
  const label = `${rounded} ${units === 'imperial' ? 'in' : 'cm'}`

  ctx.save()
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + actualPx, y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y - 4)
  ctx.lineTo(x, y + 4)
  ctx.moveTo(x + actualPx, y - 4)
  ctx.lineTo(x + actualPx, y + 4)
  ctx.stroke()

  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText(label, x + actualPx + 6, y + 4)
  ctx.restore()
}

function roundToNice(v: number): number {
  if (v <= 0.1) return 0.1
  if (v <= 0.5) return 0.5
  if (v <= 1) return 1
  if (v <= 2) return 2
  if (v <= 5) return 5
  if (v <= 10) return 10
  if (v <= 20) return 20
  if (v <= 50) return 50
  return Math.round(v / 10) * 10
}
