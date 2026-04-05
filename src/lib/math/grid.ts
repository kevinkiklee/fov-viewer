export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2

export function drawRuleOfThirds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const third_w = w / 3
  const third_h = h / 3

  ctx.beginPath()
  ctx.moveTo(third_w, 0)
  ctx.lineTo(third_w, h)
  ctx.moveTo(third_w * 2, 0)
  ctx.lineTo(third_w * 2, h)
  ctx.moveTo(0, third_h)
  ctx.lineTo(w, third_h)
  ctx.moveTo(0, third_h * 2)
  ctx.lineTo(w, third_h * 2)
  ctx.stroke()
}

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

  // Clip to image bounds so arcs never extend beyond the photo
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.clip()

  ctx.translate(w / 2, h / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-w / 2, -h / 2)

  // Largest golden rectangle that fits within the image.
  // Golden rectangles self-replicate on subdivision, so all arcs connect perfectly.
  let gw: number, gh: number
  if (w / h >= GOLDEN_RATIO) {
    // Image wider than golden ratio — fit to height
    gh = h
    gw = h * GOLDEN_RATIO
  } else {
    // Image taller than golden ratio — fit to width
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
      case 0: // Cut from right
        cx = x + rw - side
        cy = y
        startAngle = 0
        rw -= side
        break
      case 1: // Cut from bottom
        cx = x + rw
        cy = y + rh - side
        startAngle = Math.PI / 2
        rh -= side
        break
      case 2: // Cut from left
        cx = x + side
        cy = y + rh
        startAngle = Math.PI
        x += side
        rw -= side
        break
      default: // Cut from top
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
  // Main diagonal
  ctx.moveTo(0, 0)
  ctx.lineTo(w, h)
  // Perpendicular from bottom-left to main diagonal
  ctx.moveTo(0, h)
  ctx.lineTo((w * h * h) / d, (h * h * h) / d)
  // Perpendicular from top-right to main diagonal
  ctx.moveTo(w, 0)
  ctx.lineTo((w * w * w) / d, (w * w * h) / d)
  ctx.stroke()
  ctx.restore()
}

export function drawDiagonalLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(w, h)
  ctx.moveTo(w, 0)
  ctx.lineTo(0, h)
  ctx.stroke()
}

export function drawCenterCross(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const cx = w / 2
  const cy = h / 2

  ctx.beginPath()
  ctx.moveTo(cx, 0)
  ctx.lineTo(cx, h)
  ctx.moveTo(0, cy)
  ctx.lineTo(w, cy)
  ctx.stroke()
}

export function drawSquareGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  density: number,
): void {
  const stepX = w / density
  const stepY = h / density

  ctx.beginPath()
  for (let i = 1; i < density; i++) {
    ctx.moveTo(stepX * i, 0)
    ctx.lineTo(stepX * i, h)
  }
  for (let i = 1; i < density; i++) {
    ctx.moveTo(0, stepY * i)
    ctx.lineTo(w, stepY * i)
  }
  ctx.stroke()
}

export function drawTriangles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(w, h)
  ctx.moveTo(w, 0)
  ctx.lineTo(0, h)
  ctx.moveTo(0, h)
  ctx.lineTo(w, 0)
  ctx.moveTo(w, h)
  ctx.lineTo(0, 0)
  ctx.stroke()
}
