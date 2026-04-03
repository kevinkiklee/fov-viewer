'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { hslToRgb } from '@/lib/math/color'
import ch from './ColorHarmony.module.css'

interface ColorWheelProps {
  hue: number
  saturation: number
  lightness: number
  harmonyHues: number[]
  /** Node indices that can be individually dragged to adjust angles (e.g. [1,2] for split comp) */
  draggableNodes: number[]
  onHueChange: (hue: number) => void
  onSaturationChange: (saturation: number) => void
  /** Called when a draggable secondary node is dragged. Reports the node index and its new hue. */
  onSecondaryDrag: (nodeIndex: number, hue: number) => void
}

const DESKTOP_SIZE = 280
const MOBILE_SIZE = 240
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

export function ColorWheel({
  hue,
  saturation,
  lightness,
  harmonyHues,
  draggableNodes,
  onHueChange,
  onSaturationChange,
  onSecondaryDrag,
}: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  // Draw the harmony overlay (lines + dots)
  const drawOverlay = useCallback((ctx: CanvasRenderingContext2D) => {
    const cx = canvasPixels / 2
    const cy = canvasPixels / 2
    const r = cx

    const points = harmonyHues.map((h) => {
      const pos = hueToPos(h, saturation, cx, cy, r)
      return { ...pos, hue: h }
    })

    // Connecting lines
    if (points.length > 1) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 2 * dpr
      ctx.stroke()
    }

    // Dots — base dot (index matching the base hue) is larger
    // Find which index is the base hue
    const baseIndex = harmonyHues.findIndex((h) => h === (hue % 360))
    points.forEach((p, i) => {
      const isBase = i === baseIndex || (baseIndex === -1 && i === 0)
      const isDraggable = draggableNodes.includes(i)
      const dotRadius = (isBase ? 8 : 6) * dpr
      const rgb = hslToRgb(p.hue, saturation, lightness)
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)

      ctx.beginPath()
      ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2)
      ctx.fillStyle = hex
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2 * dpr
      ctx.stroke()

      // Draw a slightly larger ring around draggable nodes to hint they're interactive
      if (isDraggable) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, dotRadius + 3 * dpr, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
        ctx.lineWidth = 1 * dpr
        ctx.stroke()
      }
    })
  }, [canvasPixels, harmonyHues, saturation, lightness, hue, dpr, draggableNodes])

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
      const h = harmonyHues[nodeIdx]
      if (h === undefined) continue
      const pos = hueToPos(h, saturation, rect.width / 2, rect.height / 2, cssRadius)
      const dx = (clientX - rect.left) - pos.x
      const dy = (clientY - rect.top) - pos.y
      if (Math.sqrt(dx * dx + dy * dy) < NODE_HIT_RADIUS) {
        return nodeIdx
      }
    }
    return null
  }, [draggableNodes, harmonyHues, saturation])

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
        // Dragging a secondary node — report the hue angle to the parent
        onSecondaryDrag(dragModeRef.current, Math.round(angle) % 360)
      }
    })
  }, [getAngleFromPointer, onHueChange, onSaturationChange, onSecondaryDrag])

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
}
