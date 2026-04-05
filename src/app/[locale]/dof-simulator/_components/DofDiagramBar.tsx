'use client'

import { useMemo, useRef, useCallback } from 'react'
import {
  W, H, PAD_L, PAD_R, STRIP_Y, STRIP_H, AXIS_Y,
  distToX, xToDist, AXIS_TICKS,
} from './dof-diagram-bar-helpers'
import s from './DofDiagramBar.module.css'

interface DofDiagramBarProps {
  distance: number
  nearFocus: number
  farFocus: number
  onDistanceChange?: (meters: number) => void
}

export function DofDiagramBar({ distance, nearFocus, farFocus, onDistanceChange }: DofDiagramBarProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const draggingRef = useRef(false)

  const clientXToDistance = useCallback((clientX: number): number | null => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    return xToDist(((clientX - rect.left) / rect.width) * W)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!onDistanceChange) return
    draggingRef.current = true
    ;(e.target as Element).setPointerCapture(e.pointerId)
    const dist = clientXToDistance(e.clientX)
    if (dist !== null) onDistanceChange(dist)
  }, [onDistanceChange, clientXToDistance])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || !onDistanceChange) return
    const dist = clientXToDistance(e.clientX)
    if (dist !== null) onDistanceChange(dist)
  }, [onDistanceChange, clientXToDistance])

  const handlePointerUp = useCallback(() => { draggingRef.current = false }, [])

  const positions = useMemo(() => {
    const subjectX = distToX(distance)
    const nearX = distToX(nearFocus)
    const farX = isFinite(farFocus) ? distToX(farFocus) : W - PAD_R
    return { subjectX, nearX, farX, farIsInfinity: !isFinite(farFocus) }
  }, [distance, nearFocus, farFocus])

  const { subjectX, nearX, farX, farIsInfinity } = positions
  const focusWidth = Math.max(2, farX - nearX)
  const midY = STRIP_Y + STRIP_H / 2

  return (
    <div className={s.diagramBar}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={s.svg}
        role="img" aria-label="Depth of field distance diagram">
        <defs>
          <linearGradient id="dofbar-sharp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <rect x={PAD_L} y={STRIP_Y} width={W - PAD_L - PAD_R} height={STRIP_H}
          rx="4" fill="var(--bg-primary)" opacity="0.5" />

        {/* In-focus zone (green) */}
        <rect x={nearX} y={STRIP_Y} width={focusWidth} height={STRIP_H}
          fill="url(#dofbar-sharp)" rx="3" />
        <line x1={nearX} y1={STRIP_Y + 2} x2={nearX} y2={STRIP_Y + STRIP_H - 2}
          stroke="#22c55e" strokeWidth="1.5" opacity="0.6" />
        <line x1={farX} y1={STRIP_Y + 2} x2={farX} y2={STRIP_Y + STRIP_H - 2}
          stroke="#22c55e" strokeWidth="1.5" opacity="0.6" />

        {/* Infinity marker */}
        {farIsInfinity && (
          <text x={W - PAD_R + 2} y={midY + 4} className={s.boundaryLabel}
            textAnchor="start" fontSize="12">∞</text>
        )}

        {/* Camera icon */}
        <g transform={`translate(${PAD_L - 2}, ${midY})`}>
          <rect x="-12" y="-7" width="12" height="14" rx="2" fill="var(--text-secondary)" opacity="0.6" />
          <rect x="-7" y="-10" width="5" height="4" rx="1" fill="var(--text-secondary)" opacity="0.6" />
          <circle cx="-6" cy="0" r="3.5" fill="var(--bg-primary)" opacity="0.5" />
          <circle cx="-6" cy="0" r="2" fill="var(--text-secondary)" opacity="0.4" />
        </g>

        {/* Subject marker (draggable) */}
        <g className={s.subjectHandle}
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}>
          <rect x={subjectX - 14} y={STRIP_Y} width={28} height={STRIP_H} fill="transparent" />
          <line x1={subjectX} y1={STRIP_Y + 3} x2={subjectX} y2={STRIP_Y + STRIP_H - 3}
            stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          <circle cx={subjectX} cy={midY} r="5" fill="var(--accent)" />
          <circle cx={subjectX} cy={midY} r="2.5" fill="var(--bg-surface)" />
        </g>

        {/* Axis line */}
        <line x1={PAD_L} y1={AXIS_Y} x2={W - PAD_R} y2={AXIS_Y}
          stroke="var(--border)" strokeWidth="1" />

        {/* Scale labels */}
        {AXIS_TICKS.map(({ m, label }) => {
          const x = distToX(m)
          return (
            <g key={label}>
              <line x1={x} y1={AXIS_Y - 3} x2={x} y2={AXIS_Y + 3}
                stroke="var(--text-secondary)" strokeWidth="1" opacity="0.4" />
              <text x={x} y={AXIS_Y + 13} textAnchor="middle" className={s.tickLabel}>
                {label}
              </text>
            </g>
          )
        })}

        {/* Infinity tick */}
        <g>
          <line x1={W - PAD_R} y1={AXIS_Y - 3} x2={W - PAD_R} y2={AXIS_Y + 3}
            stroke="var(--text-secondary)" strokeWidth="1" opacity="0.4" />
          <text x={W - PAD_R} y={AXIS_Y + 13} textAnchor="middle" className={s.tickLabel}>
            ∞
          </text>
        </g>
      </svg>
    </div>
  )
}
