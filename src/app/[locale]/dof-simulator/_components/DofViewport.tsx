'use client'

import { useRef } from 'react'
import type { DofScene } from '@/lib/data/dofSimulator'
import { useDofRenderer } from './useDofRenderer'
import s from './DofViewport.module.css'

interface DofViewportProps {
  scene: DofScene | null
  focalLength: number
  aperture: number
  subjectDistance: number
  sensorWidth: number
  useDiffraction: boolean
  className?: string
}

export function DofViewport({
  scene,
  focalLength,
  aperture,
  subjectDistance,
  sensorWidth,
  useDiffraction,
  className,
}: DofViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const sceneInput = scene
    ? { photo: scene.photo, depthMap: scene.depthMap, nearDistance: scene.nearDistance, farDistance: scene.farDistance }
    : null

  const { isLoading, error } = useDofRenderer(
    canvasRef, sceneInput, focalLength, aperture, subjectDistance, sensorWidth, useDiffraction,
  )

  return (
    <div className={`${s.viewport} ${className ?? ''}`}>
      <canvas ref={canvasRef} className={s.canvas} />
      {isLoading && <div className={s.loading}>Loading scene...</div>}
      {error && <div className={s.error}>{error}</div>}
    </div>
  )
}
