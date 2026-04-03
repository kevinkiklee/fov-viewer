'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import css from './DiffractionLimit.module.css'

export type DetailType = 'text' | 'foliage' | 'architecture' | 'fabric'

interface DiffractionCanvasProps {
  pixelPitchUm: number
  limitAperture: number
  currentAperture: number
  detailType: DetailType
}

/**
 * Draw a procedural detail pattern on the given canvas context.
 * Each preset shows fine detail that reveals diffraction differently.
 */
function drawPattern(ctx: CanvasRenderingContext2D, w: number, h: number, type: DetailType) {
  ctx.fillStyle = '#f5f5f0'
  ctx.fillRect(0, 0, w, h)

  switch (type) {
    case 'text': {
      ctx.fillStyle = '#1a1a1a'
      ctx.textBaseline = 'top'
      const sizes = [10, 12, 14, 18, 24]
      let y = 20
      for (const size of sizes) {
        ctx.font = `${size}px sans-serif`
        const lines = [
          'The quick brown fox jumps over the lazy dog.',
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789',
          'Fine detail resolution test — sharp edges matter.',
        ]
        for (const line of lines) {
          ctx.fillText(line, 20, y, w - 40)
          y += size + 6
          if (y > h - 20) break
        }
        y += 10
        if (y > h - 20) break
      }
      break
    }
    case 'foliage': {
      // Small circles and irregular shapes simulating leaves/foliage
      const rng = mulberry32(42)
      for (let i = 0; i < 600; i++) {
        const x = rng() * w
        const y = rng() * h
        const r = 2 + rng() * 8
        const green = Math.floor(60 + rng() * 120)
        ctx.fillStyle = `rgb(${Math.floor(20 + rng() * 40)}, ${green}, ${Math.floor(20 + rng() * 30)})`
        ctx.beginPath()
        ctx.ellipse(x, y, r, r * (0.6 + rng() * 0.8), rng() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
      // Fine veins
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < 200; i++) {
        const x = rng() * w
        const y = rng() * h
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + (rng() - 0.5) * 20, y + (rng() - 0.5) * 20)
        ctx.stroke()
      }
      break
    }
    case 'architecture': {
      // Straight lines and grid patterns
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      // Main grid
      const spacing = 24
      for (let x = spacing; x < w; x += spacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = spacing; y < h; y += spacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      // Finer sub-grid
      ctx.strokeStyle = '#999'
      ctx.lineWidth = 0.5
      const sub = spacing / 4
      for (let x = sub; x < w; x += sub) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = sub; y < h; y += sub) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      // Window-like rectangles
      ctx.fillStyle = '#dde4ea'
      ctx.strokeStyle = '#555'
      ctx.lineWidth = 1
      for (let gx = 12; gx < w - 40; gx += spacing * 2) {
        for (let gy = 12; gy < h - 40; gy += spacing * 2) {
          ctx.fillRect(gx, gy, spacing * 1.5, spacing * 1.5)
          ctx.strokeRect(gx, gy, spacing * 1.5, spacing * 1.5)
        }
      }
      break
    }
    case 'fabric': {
      // Dense woven pattern
      const size = 6
      for (let x = 0; x < w; x += size) {
        for (let y = 0; y < h; y += size) {
          const isWarp = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0
          ctx.fillStyle = isWarp ? '#c4b5a0' : '#8b7d6b'
          ctx.fillRect(x, y, size - 1, size - 1)
        }
      }
      // Fine threads
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < w; x += size) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += size) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      break
    }
  }
}

/** Simple seeded PRNG for deterministic patterns */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function DiffractionCanvas({ pixelPitchUm, limitAperture, currentAperture, detailType }: DiffractionCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const patternRef = useRef<HTMLCanvasElement | null>(null)
  const [dividerX, setDividerX] = useState(0.5) // 0..1
  const draggingRef = useRef(false)

  // Compute blur radius from physics — smooth ramp, no hard threshold
  const airyDiskDiameter = 2.44 * 0.55 * currentAperture // µm, green light
  // Ratio of airy disk to pixel pitch: <1 = sharp, >1 = diffraction-limited
  const ratio = airyDiskDiameter / pixelPitchUm
  // Smooth ramp: starts subtly at ratio ~0.7, fully engaged by ratio ~1.3
  // Uses a smooth sigmoid-like curve instead of a hard cutoff
  const rampStart = 0.7
  const t = Math.max(0, (ratio - rampStart) / (1 - rampStart))
  const smoothT = t * t * (3 - 2 * t) // smoothstep
  const scaleFactor = 0.6
  const blurRadius = smoothT * (airyDiskDiameter - pixelPitchUm * rampStart) * scaleFactor

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    const w = Math.round(rect.width)
    const h = Math.round(rect.height)
    if (w === 0 || h === 0) return

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    // Create/cache the pattern offscreen canvas
    if (!patternRef.current || patternRef.current.width !== w * dpr || patternRef.current.height !== h * dpr) {
      const offscreen = document.createElement('canvas')
      offscreen.width = w * dpr
      offscreen.height = h * dpr
      const offCtx = offscreen.getContext('2d')
      if (offCtx) {
        offCtx.scale(dpr, dpr)
        drawPattern(offCtx, w, h, detailType)
      }
      patternRef.current = offscreen
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const splitPx = Math.round(w * dividerX)

    // Left side: sharp (original pattern)
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, splitPx, h)
    ctx.clip()
    ctx.drawImage(patternRef.current, 0, 0, w * dpr, h * dpr, 0, 0, w, h)
    ctx.restore()

    // Right side: blurred
    ctx.save()
    ctx.beginPath()
    ctx.rect(splitPx, 0, w - splitPx, h)
    ctx.clip()
    if (blurRadius > 0) {
      ctx.filter = `blur(${blurRadius}px)`
    }
    ctx.drawImage(patternRef.current, 0, 0, w * dpr, h * dpr, 0, 0, w, h)
    ctx.filter = 'none'
    ctx.restore()
  }, [dividerX, blurRadius, detailType])

  // Invalidate pattern cache when detailType changes
  useEffect(() => {
    patternRef.current = null
  }, [detailType])

  useEffect(() => {
    renderCanvas()

    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => {
      patternRef.current = null // re-create at new size
      renderCanvas()
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [renderCanvas])

  // Divider drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setDividerX(x)
  }, [])

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false
  }, [])

  // Determine optimal aperture label
  const optimalAperture = limitAperture

  return (
    <div
      ref={containerRef}
      className={css.splitView}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <canvas ref={canvasRef} className={css.splitCanvas} />

      {/* Labels */}
      <span className={`${css.splitLabel} ${css.splitLabelLeft}`}>
        f/{optimalAperture.toFixed(1)} — Sharp
      </span>
      <span className={`${css.splitLabel} ${css.splitLabelRight}`}>
        f/{currentAperture.toFixed(1)} — {blurRadius > 0.5 ? 'Diffracted' : 'Sharp'}
      </span>

      {/* Draggable divider */}
      <div
        className={css.splitDivider}
        style={{ left: `${dividerX * 100}%` }}
        onPointerDown={handlePointerDown}
      />
    </div>
  )
}
