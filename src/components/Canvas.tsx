import { useRef, useEffect, useCallback, useState } from 'react'
import type { LensConfig, Orientation } from '../types'
import { LENS_COLORS, LENS_LABELS } from '../types'
import { calcFOV, calcCropRatio } from '../utils/fov'
import { getSensor } from '../data/sensors'
import { SCENES } from '../data/scenes'

interface CanvasProps {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

// 14mm full frame = edge of the photo. Wider lenses render outside.
const REF_FOV = calcFOV(14, 1.0)

interface Rect {
  x: number
  y: number
  w: number
  h: number
  color: string
  label: string
  index: number
  fov: { horizontal: number; vertical: number }
}

export function Canvas({ lenses, imageIndex, orientation, canvasRef }: CanvasProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const animFrameRef = useRef<number>(0)
  // Custom offsets from center (in canvas pixels) for each lens, keyed by index
  const [offsets, setOffsets] = useState<Record<number, { dx: number; dy: number }>>({})
  const dragRef = useRef<{ index: number; startX: number; startY: number; origDx: number; origDy: number } | null>(null)

  const fovs = lenses.map((lens) => {
    const sensor = getSensor(lens.sensorId)
    return calcFOV(lens.focalLength, sensor.cropFactor)
  })

  const fovKey = fovs.map((f) => `${f.horizontal},${f.vertical}`).join('|')

  const computeRects = useCallback((canvas: HTMLCanvasElement): Rect[] => {
    const w = canvas.width
    const h = canvas.height
    const isPortrait = orientation === 'portrait'
    return fovs.map((fov, i) => {
      // In portrait, the canvas width maps to vertical FOV and height to horizontal
      const ratioW = calcCropRatio(
        isPortrait ? fov.vertical : fov.horizontal,
        isPortrait ? REF_FOV.vertical : REF_FOV.horizontal,
      )
      const ratioH = calcCropRatio(
        isPortrait ? fov.horizontal : fov.vertical,
        isPortrait ? REF_FOV.horizontal : REF_FOV.vertical,
      )
      const rw = w * ratioW
      const rh = h * ratioH
      const off = offsets[i] ?? { dx: 0, dy: 0 }
      return {
        x: (w - rw) / 2 + off.dx,
        y: (h - rh) / 2 + off.dy,
        w: rw,
        h: rh,
        color: LENS_COLORS[i],
        label: LENS_LABELS[i],
        index: i,
        fov,
      }
    })
  }, [fovKey, offsets, orientation])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !img.complete) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const dpr = window.devicePixelRatio || 1

    drawImageCover(ctx, img, 0, 0, w, h)

    const rects = computeRects(canvas)
    if (rects.length === 0) return

    // Draw rect borders
    for (const r of rects) {
      ctx.strokeStyle = r.color
      ctx.lineWidth = 3 * dpr
      ctx.strokeRect(r.x, r.y, r.w, r.h)
    }

    // Labels
    const fontSize = 12 * dpr
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`

    for (const r of rects) {
      const text = `${r.label} — ${r.fov.horizontal.toFixed(1)}° × ${r.fov.vertical.toFixed(1)}°`
      ctx.fillStyle = r.color
      // Label above top-left of rect
      const labelY = r.y - 6 * dpr
      if (labelY > 10 * dpr) {
        ctx.fillText(text, r.x + 8 * dpr, labelY)
      } else {
        // If too close to top, put inside
        ctx.fillText(text, r.x + 8 * dpr, r.y + 18 * dpr)
      }
    }
  }, [canvasRef, computeRects])

  // Load image
  useEffect(() => {
    const img = new Image()
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

      // 3:2 landscape or 2:3 portrait
      const aspect = orientation === 'landscape' ? 3 / 2 : 2 / 3

      let w = rect.width
      let h = w / aspect

      if (h > rect.height) {
        h = rect.height
        w = h * aspect
      }

      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      canvas.width = w * dpr
      canvas.height = h * dpr
      draw()
    })

    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [canvasRef, draw, orientation])

  // Reset offsets when lenses change
  useEffect(() => {
    setOffsets({})
  }, [lenses.length])

  // Listen for center-overlays event
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handler = () => setOffsets({})
    canvas.addEventListener('center-overlays', handler)
    return () => canvas.removeEventListener('center-overlays', handler)
  }, [canvasRef])

  // Shared coordinate helper for mouse and touch
  const getCanvasCoords = useCallback((clientX: number, clientY: number): { cx: number; cy: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { cx: 0, cy: 0 }
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    return {
      cx: (clientX - rect.left) * dpr,
      cy: (clientY - rect.top) * dpr,
    }
  }, [canvasRef])

  const startDrag = useCallback((clientX: number, clientY: number): boolean => {
    const canvas = canvasRef.current
    if (!canvas) return false
    const { cx, cy } = getCanvasCoords(clientX, clientY)
    const rects = computeRects(canvas)

    const hit = [...rects]
      .sort((a, b) => (a.w * a.h) - (b.w * b.h))
      .find((r) => cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h)

    if (hit) {
      const off = offsets[hit.index] ?? { dx: 0, dy: 0 }
      dragRef.current = { index: hit.index, startX: cx, startY: cy, origDx: off.dx, origDy: off.dy }
      return true
    }
    return false
  }, [canvasRef, computeRects, getCanvasCoords, offsets])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (startDrag(e.clientX, e.clientY)) e.preventDefault()
  }, [startDrag])

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || !dragRef.current) return

    const { cx, cy } = getCanvasCoords(clientX, clientY)
    const drag = dragRef.current
    const w = canvas.width
    const h = canvas.height

    const fov = fovs[drag.index]
    if (!fov) return
    const isPortrait = orientation === 'portrait'
    const ratioW = calcCropRatio(
      isPortrait ? fov.vertical : fov.horizontal,
      isPortrait ? REF_FOV.vertical : REF_FOV.horizontal,
    )
    const ratioH = calcCropRatio(
      isPortrait ? fov.horizontal : fov.vertical,
      isPortrait ? REF_FOV.horizontal : REF_FOV.vertical,
    )
    const rw = w * ratioW
    const rh = h * ratioH

    const maxDx = (w - rw) / 2
    const maxDy = (h - rh) / 2
    const rawDx = drag.origDx + (cx - drag.startX)
    const rawDy = drag.origDy + (cy - drag.startY)
    const newDx = Math.max(-maxDx, Math.min(maxDx, rawDx))
    const newDy = Math.max(-maxDy, Math.min(maxDy, rawDy))
    setOffsets((prev) => ({ ...prev, [drag.index]: { dx: newDx, dy: newDy } }))
  }, [canvasRef, getCanvasCoords, fovKey, orientation])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (dragRef.current) {
      canvas.style.cursor = 'grabbing'
      moveDrag(e.clientX, e.clientY)
    } else {
      const { cx, cy } = getCanvasCoords(e.clientX, e.clientY)
      const rects = computeRects(canvas)
      const hover = rects.some((r) => cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h)
      canvas.style.cursor = hover ? 'grab' : 'default'
    }
  }, [canvasRef, computeRects, getCanvasCoords, moveDrag])

  const handleMouseUp = useCallback(() => {
    dragRef.current = null
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default'
    }
  }, [canvasRef])

  const handleMouseLeave = useCallback(() => {
    dragRef.current = null
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default'
    }
  }, [canvasRef])

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    if (startDrag(t.clientX, t.clientY)) {
      e.preventDefault()
    }
  }, [startDrag])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current || e.touches.length !== 1) return
    e.preventDefault()
    const t = e.touches[0]
    moveDrag(t.clientX, t.clientY)
  }, [moveDrag])

  const handleTouchEnd = useCallback(() => {
    dragRef.current = null
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fov-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    />
  )
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const imgAspect = img.width / img.height
  const destAspect = dw / dh
  let sx: number, sy: number, sw: number, sh: number
  if (imgAspect > destAspect) {
    sh = img.height
    sw = sh * destAspect
    sx = (img.width - sw) / 2
    sy = 0
  } else {
    sw = img.width
    sh = sw / destAspect
    sx = 0
    sy = (img.height - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}
