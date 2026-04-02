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

interface PillBounds {
  x: number
  y: number
  w: number
  h: number
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
  color: string
  label: string
  index: number
  focalLength: number
  fov: { horizontal: number; vertical: number }
  pill?: PillBounds
}

export function Canvas({ lenses, imageIndex, orientation, canvasRef }: CanvasProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const animFrameRef = useRef<number>(0)
  const drawnRectsRef = useRef<Rect[]>([])
  // Custom offsets from center (in canvas pixels) for each lens, keyed by index
  const [offsets, setOffsets] = useState<Record<number, { dx: number; dy: number }>>({})
  const dragRef = useRef<{ index: number; startX: number; startY: number; origDx: number; origDy: number } | null>(null)

  const fovs = lenses.map((lens) => {
    const sensor = getSensor(lens.sensorId)
    return calcFOV(lens.focalLength, sensor.cropFactor)
  })


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
        focalLength: lenses[i].focalLength,
        fov,
      }
    })
  }, [fovs, lenses, offsets, orientation])

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

    // Group rects by same size for overlapping border handling
    const lineW = 3 * dpr
    const half = lineW / 2
    const dashLen = 10 * dpr
    const drawn = new Set<number>()

    for (let i = 0; i < rects.length; i++) {
      if (drawn.has(i)) continue
      const r = rects[i]
      const rx = Math.max(half, r.x)
      const ry = Math.max(half, r.y)
      const rr = Math.min(w - half, r.x + r.w)
      const rb = Math.min(h - half, r.y + r.h)

      // Find all rects overlapping this one (same size)
      const group = [r]
      for (let j = i + 1; j < rects.length; j++) {
        if (drawn.has(j)) continue
        const o = rects[j]
        if (Math.abs(o.w - r.w) < 2 && Math.abs(o.h - r.h) < 2) {
          group.push(o)
          drawn.add(j)
        }
      }
      drawn.add(i)

      if (group.length > 1) {
        // Alternating dashed border with all colors in the group
        ctx.lineWidth = lineW
        const segLen = dashLen
        const totalColors = group.length
        ctx.setLineDash([segLen, segLen * (totalColors - 1)])
        for (let c = 0; c < totalColors; c++) {
          ctx.lineDashOffset = -c * segLen
          ctx.strokeStyle = group[c].color
          ctx.strokeRect(rx, ry, rr - rx, rb - ry)
        }
        ctx.setLineDash([])
      } else {
        ctx.strokeStyle = r.color
        ctx.lineWidth = lineW
        ctx.setLineDash([])
        ctx.strokeRect(rx, ry, rr - rx, rb - ry)
      }
    }

    // Labels — always show all, A above B above C (A closest to rect edge)
    const fontSize = 12 * dpr
    const padX = 6 * dpr
    const padY = 3 * dpr
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`

    // Group rects by position for label stacking
    const labelGroups: Record<string, Rect[]> = {}
    for (const r of rects) {
      const posKey = `${Math.round(r.x)},${Math.round(r.y)}`
      if (!labelGroups[posKey]) labelGroups[posKey] = []
      labelGroups[posKey].push(r)
    }

    for (const group of Object.values(labelGroups)) {
      // Sort by index so A is first (closest to rect), then B, then C
      group.sort((a, b) => a.index - b.index)

      for (let si = 0; si < group.length; si++) {
        const r = group[si]
        const text = `${r.label} — ${r.focalLength}mm`
        const metrics = ctx.measureText(text)
        const textW = metrics.width
        const textH = fontSize
        const pillH = textH + padY * 2

        // Stack upward: C closest to rect, B above, A at top
        const baseY = r.y - 6 * dpr
        const reverseIdx = group.length - 1 - si
        let tx: number, ty: number
        if (baseY > (pillH * group.length) + 4 * dpr) {
          tx = r.x + 4 * dpr
          ty = baseY - reverseIdx * (pillH + 2 * dpr)
        } else {
          tx = r.x + 8 * dpr
          ty = r.y + 18 * dpr + reverseIdx * (pillH + 2 * dpr)
        }

        // Draw background pill
        const pillX = tx - padX
        const pillY = ty - textH - padY + 2 * dpr
        const pillW = textW + padX * 2
        const pillR = 4 * dpr
        r.pill = { x: pillX, y: pillY, w: pillW, h: pillH }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.beginPath()
      ctx.roundRect(pillX, pillY, pillW, pillH, pillR)
      ctx.fill()

      // Draw text
      ctx.fillStyle = r.color
      ctx.fillText(text, tx, ty)
      }
    }

    // Store rects with pill bounds for hit testing
    drawnRectsRef.current = rects
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

  // Reset offsets when lenses change (count, focal length, or sensor)
  const lensKey = lenses.map((l) => `${l.focalLength}-${l.sensorId}`).join('|')
  useEffect(() => {
    setOffsets({})
  }, [lensKey])

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
    if (!canvasRef.current) return false
    const { cx, cy } = getCanvasCoords(clientX, clientY)

    const hit = [...drawnRectsRef.current]
      .sort((a, b) => (a.w * a.h) - (b.w * b.h))
      .find((r) => hitTestRect(r, cx, cy))

    if (hit) {
      const off = offsets[hit.index] ?? { dx: 0, dy: 0 }
      dragRef.current = { index: hit.index, startX: cx, startY: cy, origDx: off.dx, origDy: off.dy }
      return true
    }
    return false
  }, [canvasRef, getCanvasCoords, offsets])

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
  }, [canvasRef, getCanvasCoords, fovs, orientation])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (dragRef.current) {
      canvas.style.cursor = 'grabbing'
      moveDrag(e.clientX, e.clientY)
    } else {
      const { cx, cy } = getCanvasCoords(e.clientX, e.clientY)
      const hover = drawnRectsRef.current.some((r) => hitTestRect(r, cx, cy))
      canvas.style.cursor = hover ? 'grab' : 'default'
    }
  }, [canvasRef, getCanvasCoords, moveDrag])

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

// Minimum clickable size for small rects (in canvas pixels)
const MIN_HIT_SIZE = 30

function hitTestRect(r: Rect, cx: number, cy: number): boolean {
  const dpr = window.devicePixelRatio || 1

  // Test the rect itself, with a minimum hit area centered on the rect
  const hitW = Math.max(r.w, MIN_HIT_SIZE * dpr)
  const hitH = Math.max(r.h, MIN_HIT_SIZE * dpr)
  const hitX = r.x + r.w / 2 - hitW / 2
  const hitY = r.y + r.h / 2 - hitH / 2
  if (cx >= hitX && cx <= hitX + hitW && cy >= hitY && cy <= hitY + hitH) return true

  // Test the label pill (stored during draw)
  if (r.pill) {
    const p = r.pill
    if (cx >= p.x && cx <= p.x + p.w && cy >= p.y && cy <= p.y + p.h) return true
  }

  return false
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
