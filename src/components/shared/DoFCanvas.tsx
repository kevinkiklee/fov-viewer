'use client'

import { useRef, useEffect, useCallback } from 'react'
import { drawScene } from './dofDrawing'
import type { SceneKey } from './dofScenes'

export type { SceneKey }

interface DoFCanvasProps {
  focusDistance: number
  aperture: number
  scene: SceneKey
  className?: string
}

export function DoFCanvas({ focusDistance, aperture, scene, className }: DoFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    if (w === 0 || h === 0) return

    canvas.width = w * dpr
    canvas.height = h * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    drawScene(ctx, w, h, focusDistance, aperture, scene)
  }, [focusDistance, aperture, scene])

  useEffect(() => {
    render()

    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => {
      render()
    })
    ro.observe(container)

    return () => ro.disconnect()
  }, [render])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
