'use client'

import { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react'
import { hslToRgb } from '@/lib/math/color'
import ch from './ColorHarmony.module.css'

interface MonoPoint {
  h: number
  s: number
  l: number
}

interface ColorWheelProps {
  hue: number
  saturation: number
  lightness: number
  harmonyHues: number[]
  /** Index of the base (key) hue in harmonyHues */
  baseIndex: number
  /** Node indices that can be individually dragged to adjust angles */
  draggableNodes: number[]
  /** For monochromatic: HSL points to show along the hue radius */
  monochromaticPoints?: MonoPoint[]
  onHueChange: (hue: number) => void
  onSaturationChange: (saturation: number) => void
  onSecondaryDrag: (nodeIndex: number, hue: number) => void
  /** For monochromatic: drag a node along the radius to adjust its saturation */
  onMonoDrag?: (nodeIndex: number, saturation: number) => void
}

const DESKTOP_SIZE = 440
const MOBILE_SIZE = 280
const BREAKPOINT = 1024

// Hit-test radius around a node dot (in CSS pixels)
const NODE_HIT_RADIUS = 16

function getCanvasSize(): number {
  if (typeof window === 'undefined') return DESKTOP_SIZE
  return window.innerWidth < BREAKPOINT ? MOBILE_SIZE : DESKTOP_SIZE
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
}

/** Convert a hue angle to x,y on the wheel rim at the given saturation */
function hueToPos(hue: number, sat: number, cx: number, cy: number, radius: number) {
  const angleRad = (hue - 90) * (Math.PI / 180)
  const dist = (sat / 100) * radius
  return { x: cx + dist * Math.cos(angleRad), y: cy + dist * Math.sin(angleRad) }
}

export interface ColorWheelHandle {
  getCanvas(): HTMLCanvasElement | null
}

export const ColorWheel = forwardRef<ColorWheelHandle, ColorWheelProps>(function ColorWheel({
  hue,
  saturation,
  lightness,
  harmonyHues,
  baseIndex,
  draggableNodes,
  monochromaticPoints,
  onHueChange,
  onSaturationChange,
  onSecondaryDrag,
  onMonoDrag,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }))
  const [size, setSize] = useState(DESKTOP_SIZE)
  const rafRef = useRef<number>(0)

  // Track which drag mode we're in:
  // null = not dragging, 'wheel' = dragging the base hue, number = dragging that node index
  const dragModeRef = useRef<null | 'wheel' | number>(null)

  useEffect(() => {
    function handleResize() { setSize(getCanvasSize()) }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const canvasPixels = size * dpr

  // Draw the HSL color wheel using ImageData for performance
  const drawWheel = useCallback((ctx: CanvasRenderingContext2D) => {
    const imageData = ctx.createImageData(canvasPixels, canvasPixels)
    const data = imageData.data
    const cx = canvasPixels / 2
    const cy = canvasPixels / 2
    const r = cx

    for (let y = 0; y < canvasPixels; y++) {
      for (let x = 0; x < canvasPixels; x++) {
        const dx = x - cx
        const dy = y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > r) continue

        let angle = Math.atan2(dx, -dy) * (180 / Math.PI)
        if (angle < 0) angle += 360

        const sat = (dist / r) * 100
        const rgb = hslToRgb(angle, sat, lightness)

        const idx = (y * canvasPixels + x) * 4
        data[idx] = rgb.r
        data[idx + 1] = rgb.g
        data[idx + 2] = rgb.b
        data[idx + 3] = 255
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }, [canvasPixels, lightness])

  // Helper: draw a dot with optional key-color double ring
  const drawDot = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, hex: string, isBase: boolean) => {
    const dotRadius = (isBase ? 11 : 8) * dpr

    // Filled dot
    ctx.beginPath()
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
    ctx.fillStyle = hex
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.5 * dpr
    ctx.stroke()

    // Key color: outer ring
    if (isBase) {
      ctx.beginPath()
      ctx.arc(x, y, dotRadius + 4 * dpr, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 1.5 * dpr
      ctx.stroke()
    }
  }, [dpr])

  // Draw the harmony overlay — Adobe Color style: lines from center to each dot
  const drawOverlay = useCallback((ctx: CanvasRenderingContext2D) => {
    const cx = canvasPixels / 2
    const cy = canvasPixels / 2
    const r = cx

    // Monochromatic: dots along the same hue angle at different saturations
    if (monochromaticPoints && monochromaticPoints.length > 0) {
      const monoPoints = monochromaticPoints.map((p) => {
        const pos = hueToPos(p.h, p.s, cx, cy, r)
        return { ...pos, ...p }
      })

      // Single line from center through all dots to the outermost
      const outermost = monoPoints.reduce((a, b) =>
        Math.hypot(a.x - cx, a.y - cy) > Math.hypot(b.x - cx, b.y - cy) ? a : b
      )
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(outermost.x, outermost.y)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1.5 * dpr
      ctx.stroke()

      // Dots along the radius
      monoPoints.forEach((p, i) => {
        const rgb = hslToRgb(p.h, p.s, p.l)
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
        drawDot(ctx, p.x, p.y, hex, i === baseIndex)
      })
      return
    }

    // Standard harmonies: lines from center to each dot on the rim
    const points = harmonyHues.map((h) => {
      const pos = hueToPos(h, saturation, cx, cy, r)
      return { ...pos, hue: h }
    })

    // Lines from center to each dot
    points.forEach((p) => {
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(p.x, p.y)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1.5 * dpr
      ctx.stroke()
    })

    // Dots on the rim
    points.forEach((p, i) => {
      const rgb = hslToRgb(p.hue, saturation, lightness)
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      drawDot(ctx, p.x, p.y, hex, i === baseIndex)
    })
  }, [canvasPixels, harmonyHues, saturation, lightness, dpr, draggableNodes, baseIndex, monochromaticPoints, drawDot])

  // Redraw on any change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = canvasPixels
    canvas.height = canvasPixels
    drawWheel(ctx)
    drawOverlay(ctx)
  }, [canvasPixels, drawWheel, drawOverlay])

  // Compute angle from pointer position relative to wheel center (0 at top, clockwise)
  const getAngleFromPointer = useCallback((clientX: number, clientY: number): { angle: number; dist: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { angle: 0, dist: 0 }
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left - rect.width / 2
    const y = clientY - rect.top - rect.height / 2
    const dist = Math.sqrt(x * x + y * y)
    let angle = Math.atan2(x, -y) * (180 / Math.PI)
    if (angle < 0) angle += 360
    return { angle, dist }
  }, [])

  // Check if pointer is near a draggable node
  const hitTestNode = useCallback((clientX: number, clientY: number): number | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const cssRadius = rect.width / 2

    for (const nodeIdx of draggableNodes) {
      let pos: { x: number; y: number }
      if (monochromaticPoints && monochromaticPoints[nodeIdx]) {
        // Monochromatic: position based on the point's own saturation
        const mp = monochromaticPoints[nodeIdx]
        pos = hueToPos(mp.h, mp.s, rect.width / 2, rect.height / 2, cssRadius)
      } else {
        const h = harmonyHues[nodeIdx]
        if (h === undefined) continue
        pos = hueToPos(h, saturation, rect.width / 2, rect.height / 2, cssRadius)
      }
      const dx = (clientX - rect.left) - pos.x
      const dy = (clientY - rect.top) - pos.y
      if (Math.sqrt(dx * dx + dy * dy) < NODE_HIT_RADIUS) {
        return nodeIdx
      }
    }
    return null
  }, [draggableNodes, harmonyHues, saturation, monochromaticPoints])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const dist = Math.sqrt(x * x + y * y)
    if (dist > rect.width / 2) return

    canvas.setPointerCapture(e.pointerId)

    // Check if we hit a draggable secondary node first
    const hitNode = hitTestNode(e.clientX, e.clientY)
    if (hitNode !== null) {
      dragModeRef.current = hitNode
      return
    }

    // Otherwise, drag the whole wheel (base hue + saturation)
    dragModeRef.current = 'wheel'
    const { angle } = getAngleFromPointer(e.clientX, e.clientY)
    onHueChange(Math.round(angle) % 360)
    const maxDist = rect.width / 2
    onSaturationChange(Math.round(Math.min(dist / maxDist, 1) * 100))
  }, [hitTestNode, getAngleFromPointer, onHueChange, onSaturationChange])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragModeRef.current === null) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    rafRef.current = requestAnimationFrame(() => {
      const { angle, dist } = getAngleFromPointer(e.clientX, e.clientY)
      const canvas = canvasRef.current
      if (!canvas) return

      if (dragModeRef.current === 'wheel') {
        // Dragging base hue
        onHueChange(Math.round(angle) % 360)
        const maxDist = canvas.getBoundingClientRect().width / 2
        onSaturationChange(Math.round(Math.min(dist / maxDist, 1) * 100))
      } else if (typeof dragModeRef.current === 'number') {
        if (monochromaticPoints && onMonoDrag) {
          // Monochromatic: adjust saturation (distance from center along the hue axis)
          const maxDist = canvas.getBoundingClientRect().width / 2
          const newSat = Math.round(Math.min(dist / maxDist, 1) * 100)
          onMonoDrag(dragModeRef.current, newSat)
        } else {
          // Other harmonies: adjust hue angle
          onSecondaryDrag(dragModeRef.current, Math.round(angle) % 360)
        }
      }
    })
  }, [getAngleFromPointer, onHueChange, onSaturationChange, onSecondaryDrag, monochromaticPoints, onMonoDrag])

  const onPointerUp = useCallback(() => {
    dragModeRef.current = null
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

  const isDragging = dragModeRef.current !== null

  return (
    <div className={ch.wheelContainer}>
      <canvas
        ref={canvasRef}
        className={ch.wheelCanvas}
        style={{
          width: size,
          height: size,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  )
})
