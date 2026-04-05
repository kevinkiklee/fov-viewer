'use client'

import { useRef, useEffect, useCallback } from 'react'
import {
  drawRuleOfThirds, drawGoldenRatio, drawGoldenSpiral, drawGoldenDiagonal,
  drawDiagonalLines, drawCenterCross, drawSquareGrid, drawTriangles,
} from '@/lib/math/grid'
import type { GridType, GridOptions } from './types'
import { thicknessToPx } from './types'

interface GridCanvasProps {
  width: number
  height: number
  activeGrids: GridType[]
  options: GridOptions
  offset?: { x: number; y: number }
}

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, opts: GridOptions) => void

const GRID_DRAW_MAP: Record<GridType, DrawFn> = {
  'rule-of-thirds': (ctx, w, h) => drawRuleOfThirds(ctx, w, h),
  'golden-ratio': (ctx, w, h) => drawGoldenRatio(ctx, w, h),
  'golden-spiral': (ctx, w, h, opts) => drawGoldenSpiral(ctx, w, h, opts.spiralRotation),
  'golden-diagonal': (ctx, w, h, opts) => drawGoldenDiagonal(ctx, w, h, opts.spiralRotation),
  'diagonal-lines': (ctx, w, h) => drawDiagonalLines(ctx, w, h),
  'center-cross': (ctx, w, h) => drawCenterCross(ctx, w, h),
  'square-grid': (ctx, w, h, opts) => drawSquareGrid(ctx, w, h, opts.gridDensity),
  'triangles': (ctx, w, h) => drawTriangles(ctx, w, h),
}

export function GridCanvas({ width, height, activeGrids, options, offset }: GridCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || activeGrids.length === 0) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = options.color
    ctx.globalAlpha = options.opacity
    ctx.lineWidth = thicknessToPx(options.thickness)

    const ox = offset?.x ?? 0
    const oy = offset?.y ?? 0

    for (const gridType of activeGrids) {
      const drawFn = GRID_DRAW_MAP[gridType]
      if (!drawFn) continue

      if (ox === 0 && oy === 0) {
        ctx.beginPath()
        drawFn(ctx, width, height, options)
      } else {
        // Tile 2×2 with modular wrapping so the pattern always fills the canvas
        const px = ((ox % width) + width) % width
        const py = ((oy % height) + height) % height
        for (let dx = -1; dx <= 0; dx++) {
          for (let dy = -1; dy <= 0; dy++) {
            ctx.save()
            ctx.translate(px + dx * width, py + dy * height)
            ctx.beginPath()
            drawFn(ctx, width, height, options)
            ctx.restore()
          }
        }
      }
    }
  }, [width, height, activeGrids, options, offset])

  useEffect(() => {
    draw()
  }, [draw])

  if (activeGrids.length === 0) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
