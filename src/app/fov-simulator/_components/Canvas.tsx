'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { LensConfig } from '@/lib/types'
import type { Orientation } from './types'
import { LENS_COLORS, LENS_LABELS } from './types'
import { calcFOV, calcCropRatio, calcFrameWidth, calcEquivFocalLength } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import { SCENES } from '@/lib/data/scenes'
import styles from './FovSimulator.module.css'

export type OverlayOffsets = Record<number, { dx: number; dy: number }>

interface CanvasProps {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  cleanCanvasRef: React.RefObject<HTMLCanvasElement | null>
  distance: number
  showGuides: boolean
  activeLens: number
  offsets: OverlayOffsets
  onOffsetsChange: React.Dispatch<React.SetStateAction<OverlayOffsets>>
  customImageSrc?: string | null
}

// Reference FOV: 14mm on full frame defines the widest view the canvas shows.
// All overlay rectangles are scaled relative to this FOV. Lenses wider than
// 14mm would extend beyond the canvas edges.
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

const FRAMING_GUIDES = [
  { label: 'full body', height: 5.5 },
  { label: 'waist up', height: 3.0 },
  { label: 'head & shoulders', height: 1.5 },
  { label: 'headshot', height: 0.8 },
]

/**
 * Draw framing guide markers on the left interior edge of an FOV rect.
 * Each guide represents a typical human subject framing height in meters.
 * Guides that don't fit within the rect or are too small are skipped.
 */
function drawFramingGuides(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  verticalFrameHeight: number,
  dpr: number,
) {
  const tickLen = 18 * dpr
  const lineX = rect.x + tickLen + 4 * dpr
  const fontSize = 10 * dpr
  ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
  ctx.setLineDash([3 * dpr, 3 * dpr])
  ctx.lineWidth = 1.5 * dpr

  const connectorLines: Array<{ x: number; topY: number; botY: number }> = []

  for (const guide of FRAMING_GUIDES) {
    const fraction = guide.height / verticalFrameHeight
    if (fraction > 1 || fraction < 0.05) continue

    const guideY = rect.y + rect.h * (1 - fraction)

    // Top tick mark (dashed) at guide level
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.beginPath()
    ctx.moveTo(rect.x + 2 * dpr, guideY)
    ctx.lineTo(rect.x + tickLen, guideY)
    ctx.stroke()

    // Bottom tick mark at rect bottom
    const botY = rect.y + rect.h
    ctx.beginPath()
    ctx.moveTo(rect.x + 2 * dpr, botY)
    ctx.lineTo(rect.x + tickLen, botY)
    ctx.stroke()

    connectorLines.push({ x: lineX, topY: guideY, botY })

    // Label with semi-transparent background
    const labelText = guide.label
    const metrics = ctx.measureText(labelText)
    const labelW = metrics.width + 6 * dpr
    const labelH = fontSize + 4 * dpr
    const labelX = rect.x + tickLen + 6 * dpr
    const labelY = guideY - 1 * dpr

    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.beginPath()
    ctx.roundRect(labelX, labelY - labelH + 2 * dpr, labelW, labelH, 3 * dpr)
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillText(labelText, labelX + 3 * dpr, labelY)

    ctx.setLineDash([3 * dpr, 3 * dpr])
  }

  // Draw vertical connector lines
  for (const { x, topY, botY } of connectorLines) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.beginPath()
    ctx.moveTo(x, topY)
    ctx.lineTo(x, botY)
    ctx.stroke()
  }

  ctx.setLineDash([])
}

export function Canvas({ lenses, imageIndex, orientation, canvasRef, cleanCanvasRef, distance, showGuides, activeLens, offsets, onOffsetsChange, customImageSrc }: CanvasProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const animFrameRef = useRef<number>(0)
  const drawnRectsRef = useRef<Rect[]>([])
  const dragRef = useRef<{ index: number; startX: number; startY: number; origDx: number; origDy: number } | null>(null)

  const fovs = lenses.map((lens) => {
    const sensor = getSensor(lens.sensorId)
    return calcFOV(lens.focalLength, sensor.cropFactor)
  })

  // Compute the overlay rectangle for each lens on the canvas.
  // Each rect is sized as a proportion of the canvas based on the ratio of
  // the lens's FOV to the reference FOV (14mm full frame).
  const computeRects = useCallback((canvas: HTMLCanvasElement): Rect[] => {
    const w = canvas.width
    const h = canvas.height
    const isPortrait = orientation === 'portrait'
    return fovs.map((fov, i) => {
      // In portrait mode, the canvas width corresponds to the vertical FOV
      // and height to horizontal, since the image is rotated.
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

    // Draw the scene image, scaled to cover the full canvas (like CSS object-fit: cover)
    drawImageCover(ctx, img, 0, 0, w, h)

    // Copy clean image (no overlays) to the offscreen canvas for CropStrip
    const cleanCanvas = cleanCanvasRef.current
    if (cleanCanvas) {
      cleanCanvas.width = w
      cleanCanvas.height = h
      const cleanCtx = cleanCanvas.getContext('2d')
      if (cleanCtx) cleanCtx.drawImage(canvas, 0, 0)
    }

    const rects = computeRects(canvas)
    if (rects.length === 0) return

    // Draw FOV overlay borders. When multiple lenses have the same FOV (same-sized
    // rects), draw alternating colored dashes instead of overlapping solid borders.
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

      // Find all rects overlapping this one (same size AND same position)
      const group = [r]
      for (let j = i + 1; j < rects.length; j++) {
        if (drawn.has(j)) continue
        const o = rects[j]
        if (Math.abs(o.w - r.w) < 2 && Math.abs(o.h - r.h) < 2
            && Math.abs(o.x - r.x) < 2 && Math.abs(o.y - r.y) < 2) {
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

    // Draw framing guides for the active lens (if enabled)
    if (showGuides && rects[activeLens]) {
      const activeRect = rects[activeLens]
      const activeFov = fovs[activeLens]
      const verticalFOV = orientation === 'portrait' ? activeFov.horizontal : activeFov.vertical
      const verticalFrameHeight = calcFrameWidth(verticalFOV, distance)
      drawFramingGuides(ctx, activeRect, verticalFrameHeight, dpr)
    }

    // Draw lens labels (e.g. "A -- 50mm") as colored pills above each rect.
    // When multiple rects share the same position, labels stack vertically.
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
        const sensor = getSensor(lenses[r.index].sensorId)
        const equivText = sensor.cropFactor !== 1
          ? ` (${calcEquivFocalLength(r.focalLength, sensor.cropFactor)}mm eq)`
          : ''
        const text = `${r.label} — ${r.focalLength}mm${equivText}`
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

    // Signal CropStrip that the clean canvas has fresh content
    cleanCanvas?.dispatchEvent(new Event('draw'))
  }, [canvasRef, computeRects, showGuides, activeLens, distance, fovs, orientation, lenses])

  // Load image
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      draw()
    }
    img.src = (imageIndex === -1 && customImageSrc) ? customImageSrc : SCENES[imageIndex]?.src ?? SCENES[0].src
  }, [imageIndex, customImageSrc, draw])

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
      const isMobile = window.innerWidth < 1024

      let w = rect.width
      let h = w / aspect

      // On desktop, constrain to parent height; on mobile, fill width and let page scroll
      if (!isMobile && h > rect.height) {
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

  // Reset offset only for the lens that changed, preserve others
  const prevLensKeysRef = useRef<string[]>([])
  const lensKeys = lenses.map((l) => `${l.focalLength}-${l.sensorId}`)
  useEffect(() => {
    const prev = prevLensKeysRef.current
    if (prev.length !== lensKeys.length) {
      // Lens count changed (added/removed) — reset all
      onOffsetsChange({})
    } else {
      // Only reset offsets for lenses whose focal length or sensor changed
      const changed: number[] = []
      for (let i = 0; i < lensKeys.length; i++) {
        if (lensKeys[i] !== prev[i]) changed.push(i)
      }
      if (changed.length > 0) {
        onOffsetsChange((prev) => {
          const next = { ...prev }
          for (const i of changed) delete next[i]
          return next
        })
      }
    }
    prevLensKeysRef.current = lensKeys
  }, [lensKeys.join('|')])

  // Listen for center-overlays event
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handler = () => onOffsetsChange({})
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

  // Begin dragging a FOV overlay. Hit-tests all rects, preferring the smallest
  // (most specific) one when overlapping, so telephoto rects are easier to grab.
  const startDrag = useCallback((clientX: number, clientY: number): boolean => {
    if (!canvasRef.current) return false
    const { cx, cy } = getCanvasCoords(clientX, clientY)

    // Sort by area ascending so we pick the smallest (innermost) overlapping rect
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

  // Update overlay position during drag, clamping so the rect stays within
  // the canvas bounds. The offset is stored relative to the rect's default
  // centered position.
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
    onOffsetsChange((prev) => ({ ...prev, [drag.index]: { dx: newDx, dy: newDy } }))
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

  // Touch handlers — allow page scroll unless dragging an overlay
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    if (startDrag(t.clientX, t.clientY)) {
      // Lock touch to drag (prevent scroll) while dragging
      if (canvasRef.current) canvasRef.current.style.touchAction = 'none'
      e.preventDefault()
    }
  }, [startDrag, canvasRef])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current || e.touches.length !== 1) return
    e.preventDefault()
    const t = e.touches[0]
    moveDrag(t.clientX, t.clientY)
  }, [moveDrag])

  const handleTouchEnd = useCallback(() => {
    dragRef.current = null
    // Restore scroll ability
    if (canvasRef.current) canvasRef.current.style.touchAction = ''
  }, [canvasRef])

  const ariaLabel = lenses.map((lens) => {
    const sensor = getSensor(lens.sensorId)
    return `${lens.focalLength}mm ${sensor.name}`
  }).join(' vs ')

  return (
    <canvas
      ref={canvasRef}
      className={styles.fovCanvas}
      aria-label={`Field of view comparison: ${ariaLabel}`}
      role="img"
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

/** Minimum touch/click target size in CSS pixels for small overlay rects. */
const MIN_HIT_SIZE = 30

/**
 * Test whether a canvas coordinate falls within a rect's interactive area.
 * Enforces a minimum hit area so that very small (telephoto) rects are still
 * clickable. Also tests the label pill if present.
 */
function hitTestRect(r: Rect, cx: number, cy: number): boolean {
  const dpr = window.devicePixelRatio || 1

  // Expand tiny rects to a minimum clickable area, centered on the rect
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

/**
 * Draw an image onto a canvas region using "cover" scaling (like CSS object-fit: cover).
 * Crops the image to fill the destination without distorting aspect ratio.
 */
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
