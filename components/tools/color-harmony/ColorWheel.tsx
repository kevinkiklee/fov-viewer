'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { hslToRgb } from '@/lib/math/color'
import ch from './ColorHarmony.module.css'

interface ColorWheelProps {
  saturation: number
  lightness: number
  harmonyHues: number[]
  onHueChange: (hue: number) => void
  onSaturationChange: (saturation: number) => void
}

const DESKTOP_SIZE = 280
const MOBILE_SIZE = 240
const BREAKPOINT = 1024

function getCanvasSize(): number {
  if (typeof window === 'undefined') return DESKTOP_SIZE
  return window.innerWidth < BREAKPOINT ? MOBILE_SIZE : DESKTOP_SIZE
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
}

export function ColorWheel({
  saturation,
  lightness,
  harmonyHues,
  onHueChange,
  onSaturationChange,
}: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState(DESKTOP_SIZE)
  const [isDragging, setIsDragging] = useState(false)
  const rafRef = useRef<number>(0)

  // Track size on resize
  useEffect(() => {
    function handleResize() {
      setSize(getCanvasSize())
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const canvasPixels = size * dpr

  // Draw the color wheel
  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const imageData = ctx.createImageData(canvasPixels, canvasPixels)
      const data = imageData.data
      const cx = canvasPixels / 2
      const cy = canvasPixels / 2
      const r = cx // radius in device pixels

      for (let y = 0; y < canvasPixels; y++) {
        for (let x = 0; x < canvasPixels; x++) {
          const dx = x - cx
          const dy = y - cy
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist > r) continue

          // Angle: 0 degrees at top, clockwise
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
    },
    [canvasPixels, lightness],
  )

  // Draw harmony overlay
  const drawOverlay = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const cx = canvasPixels / 2
      const cy = canvasPixels / 2
      const r = cx

      // Calculate positions for each harmony hue
      const points = harmonyHues.map((h) => {
        const angleRad = (h - 90) * (Math.PI / 180) // offset so 0 deg = top
        const dist = (saturation / 100) * r
        return {
          x: cx + dist * Math.cos(angleRad),
          y: cy + dist * Math.sin(angleRad),
          hue: h,
        }
      })

      // Draw connecting lines
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

      // Draw dots
      points.forEach((p, i) => {
        const dotRadius = (i === 0 ? 8 : 6) * dpr
        const rgb = hslToRgb(p.hue, saturation, lightness)
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b)

        ctx.beginPath()
        ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2)
        ctx.fillStyle = hex
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2 * dpr
        ctx.stroke()
      })
    },
    [canvasPixels, harmonyHues, saturation, lightness, dpr],
  )

  // Redraw everything when dependencies change
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

  // Handle pointer interaction
  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left - rect.width / 2
      const y = clientY - rect.top - rect.height / 2
      const dist = Math.sqrt(x * x + y * y)
      const maxDist = rect.width / 2

      // Calculate angle: 0 at top, clockwise
      let angle = Math.atan2(x, -y) * (180 / Math.PI)
      if (angle < 0) angle += 360

      const newHue = Math.round(angle) % 360
      const newSat = Math.round(Math.min(dist / maxDist, 1) * 100)

      onHueChange(newHue)
      onSaturationChange(newSat)
    },
    [onHueChange, onSaturationChange],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Check if click is within the circle
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      const dist = Math.sqrt(x * x + y * y)
      if (dist > rect.width / 2) return

      setIsDragging(true)
      canvas.setPointerCapture(e.pointerId)
      handlePointer(e.clientX, e.clientY)
    },
    [handlePointer],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDragging) return
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        handlePointer(e.clientX, e.clientY)
      })
    },
    [isDragging, handlePointer],
  )

  const onPointerUp = useCallback(() => {
    setIsDragging(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

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
