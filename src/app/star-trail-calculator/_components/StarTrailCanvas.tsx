'use client'

import { useRef, useEffect, useCallback } from 'react'
import css from './StarTrailCalculator.module.css'

interface StarTrailCanvasProps {
  mode: 'sharp' | 'trails'
  maxExposure500: number
  maxExposureNPF: number
  totalExposure: number
  latitude: number
  exposurePerFrame: number
}

interface Star {
  /** Angle around pole in radians */
  angle: number
  /** Distance from pole center in fraction of canvas radius (0-1) */
  dist: number
  /** Brightness alpha (0.3-1.0) */
  alpha: number
  /** Radius in pixels (0.5-2) */
  radius: number
}

const SIDEREAL_DAY = 86164 // seconds
const STAR_COUNT = 200
const ANIM_DURATION = 3000 // ms for trail build-up

/** Seeded PRNG (mulberry32) for consistent star positions */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateStars(count: number): Star[] {
  const rng = mulberry32(42)
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    stars.push({
      angle: rng() * Math.PI * 2,
      dist: Math.sqrt(rng()), // sqrt for uniform area distribution
      alpha: 0.3 + rng() * 0.7,
      radius: 0.5 + rng() * 1.5,
    })
  }
  return stars
}

const STARS = generateStars(STAR_COUNT)

export function StarTrailCanvas({
  mode,
  maxExposure500,
  maxExposureNPF,
  totalExposure,
  latitude,
  exposurePerFrame,
}: StarTrailCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  // Polaris position: latitude 0 = bottom, 90 = center
  const getPolePosition = useCallback(
    (w: number, h: number) => {
      const cx = w / 2
      // latitude 90 -> center (h/2), latitude 0 -> bottom edge (h)
      const cy = h - (latitude / 90) * (h / 2)
      return { cx, cy }
    },
    [latitude],
  )

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // Dark sky gradient — lighter near horizon
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#020210')
      grad.addColorStop(0.6, '#050518')
      grad.addColorStop(1, '#0a0a20')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    },
    [],
  )

  const drawStar = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, alpha: number) => {
      // Glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4)
      glow.addColorStop(0, `rgba(180, 200, 255, ${alpha * 0.3})`)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(x - radius * 4, y - radius * 4, radius * 8, radius * 8)
      // Core
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.fill()
    },
    [],
  )

  const drawSharp = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.clearRect(0, 0, w, h)
      drawBackground(ctx, w, h)

      const { cx, cy } = getPolePosition(w, h)
      const maxR = Math.max(w, h) * 0.9

      // Draw all stars with glow
      for (const star of STARS) {
        const r = star.dist * maxR
        const x = cx + Math.cos(star.angle) * r
        const y = cy + Math.sin(star.angle) * r
        drawStar(ctx, x, y, star.radius, star.alpha)
      }

      // Draw Polaris with golden tint
      const polarGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12)
      polarGlow.addColorStop(0, 'rgba(255, 255, 200, 0.4)')
      polarGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = polarGlow
      ctx.fillRect(cx - 12, cy - 12, 24, 24)
      ctx.beginPath()
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 200, 1)'
      ctx.fill()

      // Sample star at mid-distance for exposure preview
      const sampleR = maxR * 0.4
      const sampleAngle = Math.PI * 0.75
      const sx = cx + Math.cos(sampleAngle) * sampleR
      const sy = cy + Math.sin(sampleAngle) * sampleR
      const limit = maxExposureNPF

      if (exposurePerFrame <= limit) {
        // Green ring — safe, point-like star
        ctx.beginPath()
        ctx.arc(sx, sy, 8, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      } else {
        // Red streak showing trail amount
        const trailAngle = (exposurePerFrame / SIDEREAL_DAY) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(cx, cy, sampleR, sampleAngle - trailAngle / 2, sampleAngle + trailAngle / 2)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // Legend — bottom left, subtle
      ctx.font = '500 11px system-ui, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.fillText(`500 Rule: ${maxExposure500.toFixed(1)}s`, 14, h - 30)
      ctx.fillText(`NPF Rule: ${maxExposureNPF.toFixed(1)}s`, 14, h - 14)
    },
    [getPolePosition, maxExposure500, maxExposureNPF, exposurePerFrame, drawBackground, drawStar],
  )

  const drawTrails = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) => {
      ctx.clearRect(0, 0, w, h)
      drawBackground(ctx, w, h)

      const { cx, cy } = getPolePosition(w, h)
      const maxR = Math.max(w, h) * 0.9

      // Total arc angle for totalExposure
      const fullArcAngle = (totalExposure / SIDEREAL_DAY) * Math.PI * 2
      const currentArc = fullArcAngle * progress

      for (const star of STARS) {
        const r = star.dist * maxR

        // Trail glow
        ctx.beginPath()
        ctx.arc(cx, cy, r, star.angle, star.angle + currentArc)
        ctx.strokeStyle = `rgba(180, 200, 255, ${star.alpha * 0.15})`
        ctx.lineWidth = star.radius * 3
        ctx.lineCap = 'round'
        ctx.stroke()

        // Trail core
        ctx.beginPath()
        ctx.arc(cx, cy, r, star.angle, star.angle + currentArc)
        ctx.strokeStyle = `rgba(255, 255, 255, ${star.alpha * 0.7})`
        ctx.lineWidth = star.radius * 0.8
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // Draw Polaris
      const polarGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10)
      polarGlow.addColorStop(0, 'rgba(255, 255, 200, 0.3)')
      polarGlow.addColorStop(1, 'transparent')
      ctx.fillStyle = polarGlow
      ctx.fillRect(cx - 10, cy - 10, 20, 20)
      ctx.beginPath()
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 200, 1)'
      ctx.fill()

      // Legend
      ctx.font = '500 11px system-ui, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      const arcDeg = ((currentArc * 180) / Math.PI).toFixed(1)
      ctx.fillText(`Arc: ${arcDeg}\u00B0`, 14, h - 14)
    },
    [getPolePosition, totalExposure, drawBackground],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size based on container
    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    const size = Math.min(rect.width - 48, rect.height - 48, 600)
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const w = size
    const h = size

    if (mode === 'sharp') {
      drawSharp(ctx, w, h)
      return
    }

    // Trails mode: animate
    startTimeRef.current = 0

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      // Loop: build up over ANIM_DURATION, hold briefly, then reset
      const cycleTime = ANIM_DURATION + 1000 // 3s build + 1s hold
      const cycleElapsed = elapsed % cycleTime
      const progress = Math.min(cycleElapsed / ANIM_DURATION, 1)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawTrails(ctx, w, h, progress)
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [mode, drawSharp, drawTrails])

  return (
    <canvas
      ref={canvasRef}
      className={css.starCanvas}
      role="img"
      aria-label={
        mode === 'sharp'
          ? `Star field showing sharp stars at latitude ${latitude} degrees`
          : `Animated star trails at latitude ${latitude} degrees`
      }
    />
  )
}
