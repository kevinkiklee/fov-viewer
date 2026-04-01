import { useRef, useEffect, useCallback } from 'react'
import type { LensConfig, ViewMode } from '../types'
import { calcFOV, calcCropRatio } from '../utils/fov'
import { getSensor } from '../data/sensors'
import { SCENES } from '../data/scenes'

interface CanvasProps {
  lensA: LensConfig
  lensB: LensConfig
  imageIndex: number
  mode: ViewMode
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function Canvas({ lensA, lensB, imageIndex, mode, canvasRef }: CanvasProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const animFrameRef = useRef<number>(0)

  const sensorA = getSensor(lensA.sensorId)
  const sensorB = getSensor(lensB.sensorId)
  const fovA = calcFOV(lensA.focalLength, sensorA.cropFactor)
  const fovB = calcFOV(lensB.focalLength, sensorB.cropFactor)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !img.complete) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (mode === 'overlay') {
      drawOverlay(ctx, canvas, img, fovA, fovB)
    } else {
      drawSideBySide(ctx, canvas, img, fovA, fovB)
    }
  }, [canvasRef, mode, fovA.horizontal, fovA.vertical, fovB.horizontal, fovB.vertical])

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      draw()
    }
    img.src = SCENES[imageIndex].src
  }, [imageIndex, draw])

  // Redraw on parameter changes
  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(draw)
  }, [draw])

  // Resize canvas to fit container
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      // Maintain 3:2 aspect ratio
      let w = rect.width
      let h = w * (2 / 3)
      if (h > rect.height) {
        h = rect.height
        w = h * (3 / 2)
      }

      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      canvas.width = w * dpr
      canvas.height = h * dpr
      draw()
    })

    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [canvasRef, draw])

  return (
    <canvas
      ref={canvasRef}
      className="fov-canvas"
    />
  )
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  fovA: { horizontal: number; vertical: number },
  fovB: { horizontal: number; vertical: number },
) {
  const w = canvas.width
  const h = canvas.height

  // Draw full image
  ctx.drawImage(img, 0, 0, w, h)

  // Determine which FOV is wider
  const aWider = fovA.horizontal >= fovB.horizontal

  const wideH = aWider ? fovA.horizontal : fovB.horizontal
  const wideV = aWider ? fovA.vertical : fovB.vertical
  const narrowH = aWider ? fovB.horizontal : fovA.horizontal
  const narrowV = aWider ? fovB.vertical : fovA.vertical

  const ratioH = calcCropRatio(narrowH, wideH)
  const ratioV = calcCropRatio(narrowV, wideV)

  const wideColor = aWider ? '#3b82f6' : '#f59e0b'
  const narrowColor = aWider ? '#f59e0b' : '#3b82f6'

  // Draw wide rect (full canvas border)
  ctx.strokeStyle = wideColor
  ctx.lineWidth = 3 * (window.devicePixelRatio || 1)
  ctx.strokeRect(2, 2, w - 4, h - 4)

  // Draw narrow rect (proportional)
  const nw = w * ratioH
  const nh = h * ratioV
  const nx = (w - nw) / 2
  const ny = (h - nh) / 2

  ctx.strokeStyle = narrowColor
  ctx.lineWidth = 3 * (window.devicePixelRatio || 1)
  ctx.strokeRect(nx, ny, nw, nh)

  // Dim area outside narrow rect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(0, 0, w, ny)
  ctx.fillRect(0, ny + nh, w, h - ny - nh)
  ctx.fillRect(0, ny, nx, nh)
  ctx.fillRect(nx + nw, ny, w - nx - nw, nh)

  // Labels
  const dpr = window.devicePixelRatio || 1
  const fontSize = 12 * dpr
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`

  const wideLabel = aWider
    ? `A — ${fovA.horizontal.toFixed(1)}° × ${fovA.vertical.toFixed(1)}°`
    : `B — ${fovB.horizontal.toFixed(1)}° × ${fovB.vertical.toFixed(1)}°`
  ctx.fillStyle = wideColor
  ctx.fillText(wideLabel, 8 * dpr, 20 * dpr)

  const narrowLabel = aWider
    ? `B — ${fovB.horizontal.toFixed(1)}° × ${fovB.vertical.toFixed(1)}°`
    : `A — ${fovA.horizontal.toFixed(1)}° × ${fovA.vertical.toFixed(1)}°`
  ctx.fillStyle = narrowColor
  const metrics = ctx.measureText(narrowLabel)
  ctx.fillText(narrowLabel, nx + nw - metrics.width - 8 * dpr, ny + nh + 18 * dpr)
}

function drawSideBySide(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  fovA: { horizontal: number; vertical: number },
  fovB: { horizontal: number; vertical: number },
) {
  const w = canvas.width
  const h = canvas.height
  const dpr = window.devicePixelRatio || 1
  const gap = 8 * dpr

  const halfW = (w - gap) / 2

  const maxH = Math.max(fovA.horizontal, fovB.horizontal)
  const maxV = Math.max(fovA.vertical, fovB.vertical)

  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0f0f14'
  ctx.fillRect(0, 0, w, h)

  drawCroppedView(ctx, img, 0, 0, halfW, h, fovA.horizontal, fovA.vertical, maxH, maxV)
  drawCroppedView(ctx, img, halfW + gap, 0, halfW, h, fovB.horizontal, fovB.vertical, maxH, maxV)

  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2 * dpr
  ctx.strokeRect(0, 0, halfW, h)

  ctx.strokeStyle = '#f59e0b'
  ctx.strokeRect(halfW + gap, 0, halfW, h)

  const fontSize = 12 * dpr
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`

  ctx.fillStyle = '#3b82f6'
  ctx.fillText(`A — ${fovA.horizontal.toFixed(1)}° × ${fovA.vertical.toFixed(1)}°`, 8 * dpr, 20 * dpr)

  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`B — ${fovB.horizontal.toFixed(1)}° × ${fovB.vertical.toFixed(1)}°`, halfW + gap + 8 * dpr, 20 * dpr)
}

function drawCroppedView(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
  hFov: number, vFov: number,
  maxHFov: number, maxVFov: number,
) {
  const ratioH = calcCropRatio(hFov, maxHFov)
  const ratioV = calcCropRatio(vFov, maxVFov)

  const sw = img.width * ratioH
  const sh = img.height * ratioV
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) / 2

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}
