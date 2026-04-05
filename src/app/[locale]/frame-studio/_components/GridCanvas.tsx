'use client'

import { useRef, useEffect, useCallback } from 'react'
import {
  drawRuleOfThirds, drawGoldenRatio, drawGoldenSpiral, drawGoldenDiagonal,
  drawDiagonalLines, drawCenterCross, drawSquareGrid, drawTriangles,
  GOLDEN_RATIO,
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

/** For H/V line grids, returns all line positions (including a boundary at 0) */
function getLinePositions(
  gridType: GridType, w: number, h: number, opts: GridOptions,
): { v: number[]; h: number[] } | null {
  switch (gridType) {
    case 'rule-of-thirds':
      return { v: [0, w / 3, 2 * w / 3], h: [0, h / 3, 2 * h / 3] }
    case 'golden-ratio': {
      const pw = w / GOLDEN_RATIO, ph = h / GOLDEN_RATIO
      return { v: [0, w - pw, pw], h: [0, h - ph, ph] }
    }
    case 'center-cross':
      return { v: [0, w / 2], h: [0, h / 2] }
    case 'square-grid':
      return {
        v: Array.from({ length: opts.gridDensity }, (_, i) => (i * w) / opts.gridDensity),
        h: Array.from({ length: opts.gridDensity }, (_, i) => (i * h) / opts.gridDensity),
      }
    default:
      return null
  }
}

/** Draw H/V lines at computed positions, correctly wrapping with offset */
function drawOffsetLineGrid(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  positions: { v: number[]; h: number[] },
  ox: number, oy: number,
) {
  ctx.beginPath()
  for (const base of positions.v) {
    const x = ((base + ox) % w + w) % w
    if (x > 0.5) { ctx.moveTo(x, 0); ctx.lineTo(x, h) }
  }
  for (const base of positions.h) {
    const y = ((base + oy) % h + h) % h
    if (y > 0.5) { ctx.moveTo(0, y); ctx.lineTo(w, y) }
  }
  ctx.stroke()
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
        continue
      }

      // For H/V line grids, compute exact positions to ensure even spacing
      const positions = getLinePositions(gridType, width, height, options)
      if (positions) {
        drawOffsetLineGrid(ctx, width, height, positions, ox, oy)
      } else {
        // Tile 2×2 for non-line patterns (diagonals, spiral, triangles)
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
