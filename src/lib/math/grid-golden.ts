export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2

export function drawGoldenRatio(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const phiW = w / GOLDEN_RATIO
  const phiH = h / GOLDEN_RATIO

  ctx.beginPath()
  ctx.moveTo(phiW, 0)
  ctx.lineTo(phiW, h)
  ctx.moveTo(w - phiW, 0)
  ctx.lineTo(w - phiW, h)
  ctx.moveTo(0, phiH)
  ctx.lineTo(w, phiH)
  ctx.moveTo(0, h - phiH)
  ctx.lineTo(w, h - phiH)
  ctx.stroke()
}

export function drawGoldenSpiral(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rotation: 0 | 90 | 180 | 270,
): void {
  ctx.save()

  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.clip()

  ctx.translate(w / 2, h / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-w / 2, -h / 2)

  let gw: number, gh: number
  if (w / h >= GOLDEN_RATIO) {
    gh = h
    gw = h * GOLDEN_RATIO
  } else {
    gw = w
    gh = w / GOLDEN_RATIO
  }

  ctx.beginPath()

  let x = (w - gw) / 2
  let y = (h - gh) / 2
  let rw = gw
  let rh = gh

  for (let i = 0; i < 9; i++) {
    const phase = i % 4
    const side = Math.min(rw, rh)
    let cx: number, cy: number, startAngle: number

    switch (phase) {
      case 0:
        cx = x + rw - side
        cy = y
        startAngle = 0
        rw -= side
        break
      case 1:
        cx = x + rw
        cy = y + rh - side
        startAngle = Math.PI / 2
        rh -= side
        break
      case 2:
        cx = x + side
        cy = y + rh
        startAngle = Math.PI
        x += side
        rw -= side
        break
      default:
        cx = x
        cy = y + side
        startAngle = 3 * Math.PI / 2
        y += side
        rh -= side
        break
    }

    ctx.arc(cx, cy, side, startAngle, startAngle + Math.PI / 2)
  }

  ctx.stroke()
  ctx.restore()
}

export function drawGoldenDiagonal(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rotation: 0 | 90 | 180 | 270,
): void {
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-w / 2, -h / 2)

  const d = w * w + h * h

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(w, h)
  ctx.moveTo(0, h)
  ctx.lineTo((w * h * h) / d, (h * h * h) / d)
  ctx.moveTo(w, 0)
  ctx.lineTo((w * w * w) / d, (w * w * h) / d)
  ctx.stroke()
  ctx.restore()
}
