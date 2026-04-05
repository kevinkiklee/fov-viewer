'use client'

import { useMemo } from 'react'
import { calcBackgroundBlur } from '@/lib/math/dof'
import s from './BlurProfileGraph.module.css'

/* ── Layout constants (SVG viewBox coordinates) ── */
const W = 700
const H = 60
const PAD_L = 30
const PAD_R = 16
const PAD_T = 6
const PAD_B = 16
const PLOT_W = W - PAD_L - PAD_R
const PLOT_H = H - PAD_T - PAD_B

/* ── Logarithmic distance mapping (matches DofDiagramBar range) ── */
const MIN_LOG = Math.log(0.1)
const MAX_LOG = Math.log(30)
const SAMPLE_COUNT = 50

function distToX(meters: number): number {
  const clamped = Math.max(0.1, Math.min(30, meters))
  return PAD_L + ((Math.log(clamped) - MIN_LOG) / (MAX_LOG - MIN_LOG)) * PLOT_W
}

/* Distance tick marks (subset for compact graph) */
const DIST_TICKS = [0.5, 1, 3, 5, 10, 25]

interface BlurProfileGraphProps {
  focalLength: number
  aperture: number
  subjectDistance: number
  coc: number
  sensorWidth: number
}

/** Sample blur values across the distance range */
function sampleBlurCurve(
  focalLength: number,
  aperture: number,
  subjectDistance: number,
): { dist: number; blur: number }[] {
  const points: { dist: number; blur: number }[] = []
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const t = i / (SAMPLE_COUNT - 1)
    const dist = Math.exp(MIN_LOG + t * (MAX_LOG - MIN_LOG))
    // Skip the exact subject distance to avoid division-by-zero edge
    const targetDist = Math.abs(dist - subjectDistance) < 0.001
      ? subjectDistance + 0.001
      : dist
    const blur = calcBackgroundBlur({
      focalLength,
      aperture,
      subjectDistance,
      targetDistance: targetDist,
    })
    points.push({ dist, blur })
  }
  return points
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BlurProfileGraph({ focalLength, aperture, subjectDistance, coc, sensorWidth }: BlurProfileGraphProps) {
  const samples = useMemo(
    () => sampleBlurCurve(focalLength, aperture, subjectDistance),
    [focalLength, aperture, subjectDistance],
  )

  /* Auto-scale Y axis to fit the curve */
  const maxBlur = useMemo(() => {
    const peak = Math.max(...samples.map((p) => p.blur))
    return Math.max(peak, 0.01) // avoid zero range
  }, [samples])

  /* Build SVG path for the blur curve */
  const curvePath = useMemo(() => {
    const parts: string[] = []
    for (let i = 0; i < samples.length; i++) {
      const x = distToX(samples[i].dist)
      const yNorm = Math.min(samples[i].blur / maxBlur, 1)
      const y = PAD_T + PLOT_H * (1 - yNorm)
      parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return parts.join(' ')
  }, [samples, maxBlur])

  /* Compute the sharp zone (where blur < CoC) */
  const sharpZone = useMemo(() => {
    let startX: number | null = null
    let endX: number | null = null
    for (const pt of samples) {
      if (pt.blur < coc) {
        const x = distToX(pt.dist)
        if (startX === null) startX = x
        endX = x
      }
    }
    if (startX === null || endX === null) return null
    return { x: startX, width: Math.max(2, endX - startX) }
  }, [samples, coc])

  const subjectX = distToX(subjectDistance)

  return (
    <div className={s.blurProfile}>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.svg} role="img" aria-label="Blur profile graph">
        {/* Sharp zone highlight */}
        {sharpZone && (
          <rect
            x={sharpZone.x}
            y={PAD_T}
            width={sharpZone.width}
            height={PLOT_H}
            fill="#22c55e"
            opacity="0.1"
            rx="2"
          />
        )}

        {/* Blur curve */}
        <path
          d={curvePath}
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Subject marker (amber) */}
        <line
          x1={subjectX}
          y1={PAD_T}
          x2={subjectX}
          y2={PAD_T + PLOT_H}
          stroke="var(--accent)"
          strokeWidth="1.5"
          opacity="0.6"
          strokeDasharray="3,2"
        />

        {/* X-axis baseline */}
        <line
          x1={PAD_L}
          y1={PAD_T + PLOT_H}
          x2={PAD_L + PLOT_W}
          y2={PAD_T + PLOT_H}
          stroke="var(--border)"
          strokeWidth="0.5"
        />

        {/* Distance tick labels */}
        {DIST_TICKS.map((m) => {
          const x = distToX(m)
          return (
            <text key={m} x={x} y={H - 2} textAnchor="middle" className={s.tickLabel}>
              {m >= 1 ? `${m}m` : `${(m * 100).toFixed(0)}cm`}
            </text>
          )
        })}

        {/* Y-axis label (vertical) */}
        <text
          x={6}
          y={PAD_T + PLOT_H / 2}
          textAnchor="middle"
          className={s.axisLabel}
          transform={`rotate(-90, 6, ${PAD_T + PLOT_H / 2})`}
        >
          Blur
        </text>
      </svg>
    </div>
  )
}
