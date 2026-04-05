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
