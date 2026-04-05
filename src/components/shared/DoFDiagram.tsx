'use client'

import { useMemo, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import type { DoFResult } from '@/lib/math/dof'
import {
  W, H, PAD_L, PAD_R, STRIP_Y, STRIP_H, LABEL_Y, AXIS_Y,
  distToX, xToDist, formatDist, formatDistShort,
  computeBokehNear, computeBokehFar, AXIS_TICKS,
} from './dof-diagram-helpers'
import styles from './DoFDiagram.module.css'

interface DoFDiagramProps {
  result: DoFResult
  distance: number
  onDistanceChange?: (meters: number) => void
}

export function DoFDiagram({ result, distance, onDistanceChange }: DoFDiagramProps) {
  const t = useTranslations('common.dof')
  const svgRef = useRef<SVGSVGElement>(null)
  const draggingRef = useRef(false)

  const clientXToDistance = useCallback((clientX: number): number | null => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    const svgX = ((clientX - rect.left) / rect.width) * W
    return xToDist(svgX)
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

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false
  }, [])

  const positions = useMemo(() => {
    const subjectX = distToX(distance)
    const nearX = distToX(result.nearFocus)
    const farX = isFinite(result.farFocus) ? distToX(result.farFocus) : W - PAD_R
    const farIsInfinity = !isFinite(result.farFocus)
    return { subjectX, nearX, farX, farIsInfinity }
  }, [result, distance])

  const { subjectX, nearX, farX, farIsInfinity } = positions
  const focusWidth = Math.max(2, farX - nearX)
  const midX = nearX + focusWidth / 2
  const labelsCollide = (farX - nearX) < 130

  const bokehNear = useMemo(() => computeBokehNear(nearX), [nearX])
  const bokehFar = useMemo(() => computeBokehFar(farX, farIsInfinity), [farX, farIsInfinity])

  return (
    <div className={styles.container}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img"
        aria-label={t('depthOfField', { totalDoF: formatDist(result.totalDoF), nearFocus: formatDist(result.nearFocus), farFocus: formatDist(result.farFocus) })}>
        <defs>
          <linearGradient id="dof-fade-near" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="dof-fade-far" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="dof-sharp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        <rect x={PAD_L} y={STRIP_Y} width={W - PAD_L - PAD_R} height={STRIP_H} rx="6" fill="var(--bg-primary)" opacity="0.5" />
        <rect x={PAD_L} y={STRIP_Y} width={Math.max(0, nearX - PAD_L)} height={STRIP_H} fill="url(#dof-fade-near)" rx="6" />
        {bokehNear.map((c, i) => (
          <circle key={`bn${i}`} cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke="var(--accent)" strokeWidth="0.8" opacity={c.o} />
        ))}

        <rect x={nearX} y={STRIP_Y} width={focusWidth} height={STRIP_H} fill="url(#dof-sharp)" rx="3" />
        <line x1={nearX} y1={STRIP_Y + 1} x2={nearX} y2={STRIP_Y + STRIP_H - 1} stroke="var(--accent)" strokeWidth="2" opacity="0.5" />
        <line x1={farX} y1={STRIP_Y + 1} x2={farX} y2={STRIP_Y + STRIP_H - 1} stroke="var(--accent)" strokeWidth="2" opacity="0.5" />

        {!farIsInfinity && (
          <rect x={farX} y={STRIP_Y} width={Math.max(0, W - PAD_R - farX)} height={STRIP_H} fill="url(#dof-fade-far)" rx="6" />
        )}
        {bokehFar.map((c, i) => (
          <circle key={`bf${i}`} cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke="var(--accent)" strokeWidth="0.8" opacity={c.o} />
        ))}

        <g transform={`translate(${PAD_L - 2}, ${STRIP_Y + STRIP_H / 2})`}>
          <rect x="-12" y="-8" width="14" height="16" rx="2" fill="var(--text-secondary)" opacity="0.7" />
          <rect x="-8" y="-12" width="6" height="5" rx="1" fill="var(--text-secondary)" opacity="0.7" />
          <circle cx="-5" cy="0" r="4" fill="var(--bg-primary)" opacity="0.6" />
          <circle cx="-5" cy="0" r="2.5" fill="var(--text-secondary)" opacity="0.4" />
        </g>

        <g className={styles.subjectHandle} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
          <rect x={subjectX - 14} y={STRIP_Y} width={28} height={STRIP_H} fill="transparent" />
          <line x1={subjectX} y1={STRIP_Y + 4} x2={subjectX} y2={STRIP_Y + STRIP_H - 4} stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          <circle cx={subjectX} cy={STRIP_Y + STRIP_H / 2} r="5" fill="var(--accent)" />
          <circle cx={subjectX} cy={STRIP_Y + STRIP_H / 2} r="2.5" fill="var(--bg-surface)" />
        </g>

        {labelsCollide ? (
          <>
            <line x1={midX} y1={LABEL_Y - 6} x2={midX} y2={STRIP_Y + STRIP_H} stroke="var(--accent)" strokeWidth="0.8" opacity="0.35" />
            <text x={midX} y={LABEL_Y} textAnchor="middle" className={styles.boundaryLabel}>
              {formatDistShort(result.nearFocus)} – {farIsInfinity ? '∞' : formatDistShort(result.farFocus)}
            </text>
          </>
        ) : (
          <>
            <line x1={nearX} y1={LABEL_Y - 6} x2={nearX} y2={STRIP_Y + STRIP_H} stroke="var(--accent)" strokeWidth="0.8" opacity="0.35" />
            <text x={nearX} y={LABEL_Y} textAnchor="middle" className={styles.boundaryLabel}>{formatDistShort(result.nearFocus)}</text>
            <line x1={farX} y1={LABEL_Y - 6} x2={farX} y2={STRIP_Y + STRIP_H} stroke="var(--accent)" strokeWidth="0.8" opacity="0.35" />
            <text x={farX} y={LABEL_Y} textAnchor="middle" className={styles.boundaryLabel}>{farIsInfinity ? '∞' : formatDistShort(result.farFocus)}</text>
          </>
        )}

        <line x1={PAD_L} y1={AXIS_Y} x2={W - PAD_R} y2={AXIS_Y} stroke="var(--border)" strokeWidth="1" />
        {AXIS_TICKS.map((t) => {
          const x = distToX(t)
          return (
            <g key={t}>
              <line x1={x} y1={AXIS_Y - 3} x2={x} y2={AXIS_Y + 3} stroke="var(--text-secondary)" strokeWidth="1" opacity="0.4" />
              <text x={x} y={AXIS_Y + 14} textAnchor="middle" className={styles.tickLabel}>
                {t >= 1 ? `${t}m` : `${t * 100}cm`}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
