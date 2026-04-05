export interface Star {
  angle: number
  dist: number
  alpha: number
  radius: number
}

export const SIDEREAL_DAY = 86164
export const STAR_COUNT = 200
export const ANIM_DURATION = 3000

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateStars(count: number): Star[] {
  const rng = mulberry32(42)
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    stars.push({
      angle: rng() * Math.PI * 2,
      dist: Math.sqrt(rng()),
      alpha: 0.3 + rng() * 0.7,
      radius: 0.5 + rng() * 1.5,
    })
  }
  return stars
}

export function drawSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  getHorizonY: (h: number) => number,
) {
  const horizonY = getHorizonY(h)
  const grad = ctx.createLinearGradient(0, 0, 0, Math.min(horizonY, h))
  grad.addColorStop(0, '#020210')
  grad.addColorStop(0.6, '#050518')
  grad.addColorStop(1, '#0c0c28')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

export function drawTerrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  getHorizonY: (h: number) => number,
) {
  const horizonY = getHorizonY(h)
  if (horizonY >= h) return

  const glowH = 40
  const glow = ctx.createLinearGradient(0, horizonY - glowH, 0, horizonY)
  glow.addColorStop(0, 'transparent')
  glow.addColorStop(1, 'rgba(40, 30, 60, 0.4)')
  ctx.fillStyle = glow
  ctx.fillRect(0, horizonY - glowH, w, glowH)

  ctx.beginPath()
  ctx.moveTo(0, horizonY)
  for (let x = 0; x <= w; x += 2) {
    const y = horizonY
      - Math.sin(x * 0.008) * 12
      - Math.sin(x * 0.02 + 1) * 6
      - Math.sin(x * 0.05 + 3) * 3
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fillStyle = '#0a0a0e'
  ctx.fill()
}

export function drawStarGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4)
  glow.addColorStop(0, `rgba(180, 200, 255, ${alpha * 0.3})`)
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(x - radius * 4, y - radius * 4, radius * 8, radius * 8)
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
  ctx.fill()
}

export function drawPolaris(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const polarGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12)
  polarGlow.addColorStop(0, 'rgba(255, 255, 200, 0.4)')
  polarGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = polarGlow
  ctx.fillRect(cx - 12, cy - 12, 24, 24)
  ctx.beginPath()
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 200, 1)'
  ctx.fill()
}

export function drawPolarisSmall(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const polarGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10)
  polarGlow.addColorStop(0, 'rgba(255, 255, 200, 0.3)')
  polarGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = polarGlow
  ctx.fillRect(cx - 10, cy - 10, 20, 20)
  ctx.beginPath()
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 200, 1)'
  ctx.fill()
}
