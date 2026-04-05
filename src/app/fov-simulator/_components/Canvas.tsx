'use client'

import { useRef, useEffect, useCallback } from 'react'
import { calcFOV, calcCropRatio, calcFrameWidth, calcEquivFocalLength } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import { SCENES } from '@/lib/data/scenes'
import type { LensConfig } from '@/lib/types'
import { LENS_COLORS, LENS_LABELS } from '@/lib/data/fovSimulator'
import type { Rect, CanvasProps } from './canvasTypes'
import { drawFramingGuides, drawImageCover } from './canvasDrawing'
import { useCanvasDrag } from './useCanvasDrag'
import styles from './FovSimulator.module.css'

export type { OverlayOffsets } from './canvasTypes'

const REF_FOV = calcFOV(14, 1.0)

export function Canvas({ lenses, imageIndex, orientation, canvasRef, cleanCanvasRef, distance, showGuides, activeLens, offsets, onOffsetsChange, customImageSrc, sourceImageRef }: CanvasProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const animFrameRef = useRef<number>(0)
  const drawnRectsRef = useRef<Rect[]>([])

  const fovs = lenses.map((lens) => calcFOV(getSensor(lens.sensorId).cropFactor, 1).horizontal === 0 ? calcFOV(lens.focalLength, 1) : calcFOV(lens.focalLength, getSensor(lens.sensorId).cropFactor))

  const {
    handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave,
    handleTouchStart, handleTouchMove, handleTouchEnd,
  } = useCanvasDrag(canvasRef, drawnRectsRef, lenses, offsets, onOffsetsChange, orientation)

  const computeRects = useCallback((canvas: HTMLCanvasElement): Rect[] => {
    const w = canvas.width; const h = canvas.height
    const isPortrait = orientation === 'portrait'
    return fovs.map((fov, i) => {
      const ratioW = calcCropRatio(isPortrait ? fov.vertical : fov.horizontal, isPortrait ? REF_FOV.vertical : REF_FOV.horizontal)
      const ratioH = calcCropRatio(isPortrait ? fov.horizontal : fov.vertical, isPortrait ? REF_FOV.horizontal : REF_FOV.vertical)
      const rw = w * ratioW; const rh = h * ratioH
      const off = offsets[i] ?? { dx: 0, dy: 0 }
      return { x: (w - rw) / 2 + off.dx, y: (h - rh) / 2 + off.dy, w: rw, h: rh, color: LENS_COLORS[i], label: LENS_LABELS[i], index: i, focalLength: lenses[i].focalLength, fov }
    })
  }, [fovs, lenses, offsets, orientation])

  const draw = useCallback(() => {
    const canvas = canvasRef.current; const img = imageRef.current
    if (!canvas || !img || !img.complete) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width; const h = canvas.height; const dpr = window.devicePixelRatio || 1

    drawImageCover(ctx, img, 0, 0, w, h)
    const cleanCanvas = cleanCanvasRef.current
    if (cleanCanvas) { cleanCanvas.width = w; cleanCanvas.height = h; cleanCanvas.getContext('2d')?.drawImage(canvas, 0, 0) }

    const rects = computeRects(canvas)
    if (rects.length === 0) return
    drawOverlayBorders(ctx, rects, w, h, dpr)

    if (showGuides && rects[activeLens]) {
      const activeFov = fovs[activeLens]
      const verticalFOV = orientation === 'portrait' ? activeFov.horizontal : activeFov.vertical
      drawFramingGuides(ctx, rects[activeLens], calcFrameWidth(verticalFOV, distance), dpr)
    }

    drawLensLabels(ctx, rects, lenses, dpr)
    drawnRectsRef.current = rects
    cleanCanvas?.dispatchEvent(new Event('draw'))
  }, [canvasRef, cleanCanvasRef, computeRects, showGuides, activeLens, distance, fovs, orientation, lenses])

  useEffect(() => {
    const img = new Image()
    img.onload = () => { imageRef.current = img; if (sourceImageRef) sourceImageRef.current = img; draw() }
    img.src = (imageIndex === -1 && customImageSrc) ? customImageSrc : SCENES[imageIndex]?.src ?? SCENES[0].src
  }, [imageIndex, customImageSrc, draw, sourceImageRef])

  useEffect(() => { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = requestAnimationFrame(draw) }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement; if (!parent) return
      const rect = parent.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1
      const aspect = orientation === 'landscape' ? 3 / 2 : 2 / 3
      const isMobile = window.innerWidth < 1024
      let w = rect.width; let h = w / aspect
      if (!isMobile && h > rect.height) { h = rect.height; w = h * aspect }
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
      canvas.width = w * dpr; canvas.height = h * dpr; draw()
    })
    observer.observe(canvas.parentElement!); return () => observer.disconnect()
  }, [canvasRef, draw, orientation])

  const prevLensKeysRef = useRef<string[]>([])
  const lensKeysJoined = lenses.map((l) => `${l.focalLength}-${l.sensorId}`).join('|')
  useEffect(() => {
    const lensKeys = lensKeysJoined.split('|'); const prev = prevLensKeysRef.current
    if (prev.length !== lensKeys.length) { onOffsetsChange({}) }
    else {
      const changed: number[] = []
      for (let i = 0; i < lensKeys.length; i++) { if (lensKeys[i] !== prev[i]) changed.push(i) }
      if (changed.length > 0) onOffsetsChange((prev) => { const next = { ...prev }; for (const i of changed) delete next[i]; return next })
    }
    prevLensKeysRef.current = lensKeys
  }, [lensKeysJoined, onOffsetsChange])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const handler = () => onOffsetsChange({})
    canvas.addEventListener('center-overlays', handler); return () => canvas.removeEventListener('center-overlays', handler)
  }, [canvasRef, onOffsetsChange])

  const ariaLabel = lenses.map((lens) => `${lens.focalLength}mm ${getSensor(lens.sensorId).name}`).join(' vs ')

  return (
    <canvas ref={canvasRef} className={styles.fovCanvas} aria-label={`Field of view comparison: ${ariaLabel}`} role="img"
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd} />
  )
}

function drawOverlayBorders(ctx: CanvasRenderingContext2D, rects: Rect[], w: number, h: number, dpr: number) {
  const lineW = 3 * dpr; const half = lineW / 2; const dashLen = 10 * dpr
  const drawn = new Set<number>()
  for (let i = 0; i < rects.length; i++) {
    if (drawn.has(i)) continue
    const r = rects[i]
    const rx = Math.max(half, r.x); const ry = Math.max(half, r.y)
    const rr = Math.min(w - half, r.x + r.w); const rb = Math.min(h - half, r.y + r.h)
    const group = [r]
    for (let j = i + 1; j < rects.length; j++) {
      if (drawn.has(j)) continue
      const o = rects[j]
      if (Math.abs(o.w - r.w) < 2 && Math.abs(o.h - r.h) < 2 && Math.abs(o.x - r.x) < 2 && Math.abs(o.y - r.y) < 2) { group.push(o); drawn.add(j) }
    }
    drawn.add(i)
    if (group.length > 1) {
      ctx.lineWidth = lineW; ctx.setLineDash([dashLen, dashLen * (group.length - 1)])
      for (let c = 0; c < group.length; c++) { ctx.lineDashOffset = -c * dashLen; ctx.strokeStyle = group[c].color; ctx.strokeRect(rx, ry, rr - rx, rb - ry) }
      ctx.setLineDash([])
    } else { ctx.strokeStyle = r.color; ctx.lineWidth = lineW; ctx.setLineDash([]); ctx.strokeRect(rx, ry, rr - rx, rb - ry) }
  }
}

function drawLensLabels(ctx: CanvasRenderingContext2D, rects: Rect[], lenses: LensConfig[], dpr: number) {
  const fontSize = 12 * dpr; const padX = 6 * dpr; const padY = 3 * dpr
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
  const labelGroups: Record<string, Rect[]> = {}
  for (const r of rects) { const k = `${Math.round(r.x)},${Math.round(r.y)}`; if (!labelGroups[k]) labelGroups[k] = []; labelGroups[k].push(r) }
  for (const group of Object.values(labelGroups)) {
    group.sort((a, b) => a.index - b.index)
    for (let si = 0; si < group.length; si++) {
      const r = group[si]; const sensor = getSensor(lenses[r.index].sensorId)
      const equivText = sensor.cropFactor !== 1 ? ` (${calcEquivFocalLength(r.focalLength, sensor.cropFactor)}mm eq)` : ''
      const text = `${r.label} — ${r.focalLength}mm${equivText}`
      const textW = ctx.measureText(text).width; const textH = fontSize; const pillH = textH + padY * 2
      const baseY = r.y - 6 * dpr; const reverseIdx = group.length - 1 - si
      let tx: number, ty: number
      if (baseY > (pillH * group.length) + 4 * dpr) { tx = r.x + 4 * dpr; ty = baseY - reverseIdx * (pillH + 2 * dpr) }
      else { tx = r.x + 8 * dpr; ty = r.y + 18 * dpr + reverseIdx * (pillH + 2 * dpr) }
      const pillX = tx - padX; const pillY = ty - textH - padY + 2 * dpr; const pillW = textW + padX * 2
      r.pill = { x: pillX, y: pillY, w: pillW, h: pillH }
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.beginPath(); ctx.roundRect(pillX, pillY, pillW, pillH, 4 * dpr); ctx.fill()
      ctx.fillStyle = r.color; ctx.fillText(text, tx, ty)
    }
  }
}
