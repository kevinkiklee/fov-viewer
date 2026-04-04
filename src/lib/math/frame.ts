import type {
  GradientDirection,
  TexturePreset,
} from '@/app/frame-studio/_components/types'

export interface ShadowOptions {
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

interface TextureConfig {
  baseColor: [number, number, number]
  noiseAmount: number
  noiseScale: number
}

export const TEXTURE_PRESETS: Record<TexturePreset, TextureConfig> = {
  linen: { baseColor: [240, 234, 224], noiseAmount: 15, noiseScale: 1 },
  'film-grain': { baseColor: [30, 30, 30], noiseAmount: 40, noiseScale: 1 },
  canvas: { baseColor: [225, 218, 200], noiseAmount: 25, noiseScale: 2 },
  paper: { baseColor: [250, 248, 242], noiseAmount: 8, noiseScale: 1 },
  wood: { baseColor: [160, 120, 80], noiseAmount: 30, noiseScale: 3 },
  marble: { baseColor: [235, 235, 235], noiseAmount: 20, noiseScale: 4 },
}

export function computeExportDimensions(
  imageW: number,
  imageH: number,
  borderWidth: number,
  innerMatWidth: number,
): { width: number; height: number } {
  const total = borderWidth + innerMatWidth
  return {
    width: imageW + total * 2,
    height: imageH + total * 2,
  }
}

export function drawSolidBorder(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  color: string,
  cornerRadius: number,
): void {
  ctx.fillStyle = color
  if (cornerRadius > 0) {
    ctx.beginPath()
    ctx.roundRect(0, 0, canvasW, canvasH, cornerRadius)
    ctx.fill()
  } else {
    ctx.fillRect(0, 0, canvasW, canvasH)
  }
}

export function drawGradientBorder(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  color1: string,
  color2: string,
  direction: GradientDirection,
  cornerRadius: number,
): void {
  let gradient: CanvasGradient

  if (direction === 'radial') {
    const cx = canvasW / 2
    const cy = canvasH / 2
    const r = Math.max(canvasW, canvasH) / 2
    gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  } else {
    const coords = gradientCoords(canvasW, canvasH, direction)
    gradient = ctx.createLinearGradient(...coords)
  }

  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)
  ctx.fillStyle = gradient as unknown as string

  if (cornerRadius > 0) {
    ctx.beginPath()
    ctx.roundRect(0, 0, canvasW, canvasH, cornerRadius)
    ctx.fill()
  } else {
    ctx.fillRect(0, 0, canvasW, canvasH)
  }
}

function gradientCoords(
  w: number,
  h: number,
  dir: Exclude<GradientDirection, 'radial'>,
): [number, number, number, number] {
  switch (dir) {
    case 'top': return [0, h, 0, 0]
    case 'bottom': return [0, 0, 0, h]
    case 'left': return [w, 0, 0, 0]
    case 'right': return [0, 0, w, 0]
    case 'diagonal-tl': return [w, h, 0, 0]
    case 'diagonal-tr': return [0, h, w, 0]
  }
}

export function drawTextureBorder(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  texture: TexturePreset,
  cornerRadius: number,
): void {
  const config = TEXTURE_PRESETS[texture]
  const pattern = generateTexture(config, canvasW, canvasH)

  if (cornerRadius > 0) {
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(0, 0, canvasW, canvasH, cornerRadius)
    ctx.clip()
    ctx.drawImage(pattern as HTMLCanvasElement, 0, 0)
    ctx.restore()
  } else {
    ctx.drawImage(pattern as HTMLCanvasElement, 0, 0)
  }
}

export function generateTexture(
  config: TextureConfig,
  w: number,
  h: number,
): HTMLCanvasElement | OffscreenCanvas {
  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(w, h)
    : document.createElement('canvas')

  if ('width' in canvas && !(canvas instanceof OffscreenCanvas)) {
    canvas.width = w
    canvas.height = h
  }

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const imageData = ctx.createImageData(w, h)
  const data = imageData.data

  const [br, bg, bb] = config.baseColor
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * config.noiseAmount * 2
    data[i] = Math.max(0, Math.min(255, br + noise))
    data[i + 1] = Math.max(0, Math.min(255, bg + noise))
    data[i + 2] = Math.max(0, Math.min(255, bb + noise))
    data[i + 3] = 255
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

export function drawInnerMat(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  borderWidth: number,
  cornerRadius: number,
  matWidth: number,
  matColor: string,
): void {
  ctx.fillStyle = matColor
  const x = borderWidth
  const y = borderWidth
  const w = canvasW - borderWidth * 2
  const h = canvasH - borderWidth * 2

  if (cornerRadius > 0) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, Math.max(0, cornerRadius - borderWidth / 2))
    ctx.fill()
  } else {
    ctx.fillRect(x, y, w, h)
  }
}

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  borderWidth: number,
  cornerRadius: number,
  options: ShadowOptions,
): void {
  ctx.save()
  ctx.shadowColor = options.color
  ctx.shadowBlur = options.blur
  ctx.shadowOffsetX = options.offsetX
  ctx.shadowOffsetY = options.offsetY
  ctx.fillStyle = 'rgba(0,0,0,0)'
  if (cornerRadius > 0) {
    ctx.beginPath()
    ctx.roundRect(0, 0, canvasW, canvasH, cornerRadius)
    ctx.fill()
  } else {
    ctx.fillRect(0, 0, canvasW, canvasH)
  }
  ctx.restore()
}
