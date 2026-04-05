'use client'

import { useRef, useCallback } from 'react'
import type { ABMode } from '@/lib/data/dofSimulator'
import s from './ABComparison.module.css'

interface ABComparisonProps {
  mode: ABMode
  dividerPosition: number
  onDividerChange: (pos: number) => void
  settingsLabelA?: string
  settingsLabelB?: string
  viewportA: React.ReactNode
  viewportB: React.ReactNode
}

export function ABComparison({
  mode,
  dividerPosition,
  onDividerChange,
  settingsLabelA,
  settingsLabelB,
  viewportA,
  viewportB,
}: ABComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const posFromClientX = useCallback(
    (clientX: number): number => {
      const el = containerRef.current
      if (!el) return dividerPosition
      const rect = el.getBoundingClientRect()
      return Math.max(0.1, Math.min(0.9, (clientX - rect.left) / rect.width))
    },
    [dividerPosition],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      draggingRef.current = true
      ;(e.target as Element).setPointerCapture(e.pointerId)
      onDividerChange(posFromClientX(e.clientX))
    },
    [onDividerChange, posFromClientX],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return
      onDividerChange(posFromClientX(e.clientX))
    },
    [onDividerChange, posFromClientX],
  )

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false
  }, [])

  if (mode === 'off') return <>{viewportA}</>

  if (mode === 'wipe') {
    return (
      <div ref={containerRef} className={s.wipeContainer}>
        <div className={s.wipeLayerA}>{viewportA}</div>
        <div
          className={s.wipeLayerB}
          style={{ clipPath: `inset(0 0 0 ${dividerPosition * 100}%)` }}
        >
          {viewportB}
        </div>

        {/* Draggable divider */}
        <div
          className={s.wipeDivider}
          style={{ left: `${dividerPosition * 100}%` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className={s.wipeDividerHandle} />
        </div>

        {/* Labels */}
        {settingsLabelA && <div className={s.labelA}>{settingsLabelA}</div>}
        {settingsLabelB && <div className={s.labelB}>{settingsLabelB}</div>}
      </div>
    )
  }

  if (mode === 'split') {
    return (
      <div className={s.splitContainer}>
        <div className={s.splitPane}>
          {viewportA}
          {settingsLabelA && (
            <div className={s.splitLabel}>{settingsLabelA}</div>
          )}
        </div>
        <div className={s.splitPane}>
          {viewportB}
          {settingsLabelB && (
            <div className={s.splitLabel}>{settingsLabelB}</div>
          )}
        </div>
      </div>
    )
  }

  return <>{viewportA}</>
}
