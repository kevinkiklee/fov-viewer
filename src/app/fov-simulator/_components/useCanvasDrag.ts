'use client'

import { useRef, useCallback } from 'react'
import { calcFOV, calcCropRatio } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import type { LensConfig } from '@/lib/types'
import type { Rect, OverlayOffsets } from './canvasTypes'
import type { Orientation } from './types'
import { hitTestRect } from './canvasDrawing'

const REF_FOV = calcFOV(14, 1.0)

export function useCanvasDrag(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  drawnRectsRef: React.MutableRefObject<Rect[]>,
  lenses: LensConfig[],
  offsets: OverlayOffsets,
  onOffsetsChange: React.Dispatch<React.SetStateAction<OverlayOffsets>>,
  orientation: Orientation,
) {
  const dragRef = useRef<{ index: number; startX: number; startY: number; origDx: number; origDy: number } | null>(null)

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { cx: 0, cy: 0 }
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    return { cx: (clientX - rect.left) * dpr, cy: (clientY - rect.top) * dpr }
  }, [canvasRef])

  const startDrag = useCallback((clientX: number, clientY: number): boolean => {
    if (!canvasRef.current) return false
    const { cx, cy } = getCanvasCoords(clientX, clientY)
    const hit = [...drawnRectsRef.current].sort((a, b) => (a.w * a.h) - (b.w * b.h)).find((r) => hitTestRect(r, cx, cy))
    if (hit) {
      const off = offsets[hit.index] ?? { dx: 0, dy: 0 }
      dragRef.current = { index: hit.index, startX: cx, startY: cy, origDx: off.dx, origDy: off.dy }
      return true
    }
    return false
  }, [canvasRef, getCanvasCoords, offsets, drawnRectsRef])

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || !dragRef.current) return
    const { cx, cy } = getCanvasCoords(clientX, clientY)
    const drag = dragRef.current
    const w = canvas.width; const h = canvas.height
    const sensor = getSensor(lenses[drag.index].sensorId)
    const fov = calcFOV(lenses[drag.index].focalLength, sensor.cropFactor)
    if (!fov) return
    const isPortrait = orientation === 'portrait'
    const ratioW = calcCropRatio(isPortrait ? fov.vertical : fov.horizontal, isPortrait ? REF_FOV.vertical : REF_FOV.horizontal)
    const ratioH = calcCropRatio(isPortrait ? fov.horizontal : fov.vertical, isPortrait ? REF_FOV.horizontal : REF_FOV.vertical)
    const rw = w * ratioW; const rh = h * ratioH
    const maxDx = (w - rw) / 2; const maxDy = (h - rh) / 2
    const newDx = Math.max(-maxDx, Math.min(maxDx, drag.origDx + (cx - drag.startX)))
    const newDy = Math.max(-maxDy, Math.min(maxDy, drag.origDy + (cy - drag.startY)))
    onOffsetsChange((prev) => ({ ...prev, [drag.index]: { dx: newDx, dy: newDy } }))
  }, [canvasRef, getCanvasCoords, lenses, orientation, onOffsetsChange])

  const handleMouseDown = useCallback((e: React.MouseEvent) => { if (startDrag(e.clientX, e.clientY)) e.preventDefault() }, [startDrag])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (dragRef.current) { canvas.style.cursor = 'grabbing'; moveDrag(e.clientX, e.clientY) }
    else { const { cx, cy } = getCanvasCoords(e.clientX, e.clientY); canvas.style.cursor = drawnRectsRef.current.some((r) => hitTestRect(r, cx, cy)) ? 'grab' : 'default' }
  }, [canvasRef, getCanvasCoords, moveDrag, drawnRectsRef])

  const handleMouseUp = useCallback(() => { dragRef.current = null; if (canvasRef.current) canvasRef.current.style.cursor = 'default' }, [canvasRef])
  const handleMouseLeave = useCallback(() => { dragRef.current = null; if (canvasRef.current) canvasRef.current.style.cursor = 'default' }, [canvasRef])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    if (startDrag(t.clientX, t.clientY)) { if (canvasRef.current) canvasRef.current.style.touchAction = 'none'; e.preventDefault() }
  }, [startDrag, canvasRef])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current || e.touches.length !== 1) return
    e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY)
  }, [moveDrag])

  const handleTouchEnd = useCallback(() => { dragRef.current = null; if (canvasRef.current) canvasRef.current.style.touchAction = '' }, [canvasRef])

  return {
    handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave,
    handleTouchStart, handleTouchMove, handleTouchEnd,
  }
}
