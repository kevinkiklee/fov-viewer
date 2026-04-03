'use client'

import { useRef, useEffect } from 'react'
import type { LensConfig } from '@/lib/types'
import type { Orientation } from './types'
import type { OverlayOffsets } from './Canvas'
import { LENS_COLORS, LENS_LABELS } from './types'
import { calcFOV, calcCropRatio } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import styles from './CropStrip.module.css'

const REF_FOV = calcFOV(14, 1.0)

interface CropThumbProps {
  lens: LensConfig
  orientation: Orientation
  color: string
  lensIndex: number
  isActive: boolean
  onSelect: () => void
  offset: { dx: number; dy: number }
  cleanCanvasRef: React.RefObject<HTMLCanvasElement | null>
}

function CropThumb({ lens, orientation, color, lensIndex, isActive, onSelect, offset, cleanCanvasRef }: CropThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const render = () => {
    const canvas = canvasRef.current
    const mainCanvas = cleanCanvasRef.current
    if (!canvas || !mainCanvas) return
    if (mainCanvas.width === 0 || mainCanvas.height === 0) return

    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    const displayW = parent.offsetWidth
    const displayH = parent.offsetHeight
    canvas.width = displayW * dpr
    canvas.height = displayH * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sensor = getSensor(lens.sensorId)
    const fov = calcFOV(lens.focalLength, sensor.cropFactor)
    const isPortrait = orientation === 'portrait'

    const mainW = mainCanvas.width
    const mainH = mainCanvas.height

    const ratioW = calcCropRatio(
      isPortrait ? fov.vertical : fov.horizontal,
      isPortrait ? REF_FOV.vertical : REF_FOV.horizontal,
    )
    const ratioH = calcCropRatio(
      isPortrait ? fov.horizontal : fov.vertical,
      isPortrait ? REF_FOV.horizontal : REF_FOV.vertical,
    )

    const rectW = mainW * ratioW
    const rectH = mainH * ratioH
    const rectX = (mainW - rectW) / 2 + offset.dx
    const rectY = (mainH - rectH) / 2 + offset.dy

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(mainCanvas, rectX, rectY, rectW, rectH, 0, 0, canvas.width, canvas.height)
  }

  // Re-render when lens/orientation/offset changes
  useEffect(render, [lens, orientation, offset, cleanCanvasRef])

  // Re-render when Canvas signals a fresh draw on the cleanCanvas
  useEffect(() => {
    const cleanCanvas = cleanCanvasRef.current
    if (!cleanCanvas) return
    cleanCanvas.addEventListener('draw', render)
    return () => cleanCanvas.removeEventListener('draw', render)
  })

  return (
    <button
      className={styles.thumb}
      style={{ borderColor: color, opacity: isActive ? 1 : 0.6 }}
      onClick={onSelect}
      title={`Lens ${LENS_LABELS[lensIndex]} — ${lens.focalLength}mm`}
    >
      <canvas ref={canvasRef} />
      <span className={styles.thumbLabel}>{LENS_LABELS[lensIndex]} — {lens.focalLength}mm</span>
    </button>
  )
}

interface CropStripProps {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  activeLens: number
  onSelectLens: (index: number) => void
  offsets: OverlayOffsets
  expanded: boolean
  onToggleExpand: () => void
  cleanCanvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function CropStrip({ lenses, imageIndex, orientation, activeLens, onSelectLens, offsets, expanded, onToggleExpand, cleanCanvasRef }: CropStripProps) {
  return (
    <div className={`${styles.strip} ${expanded ? styles.stripExpanded : ''}`}>
      <div className={styles.stripHeader}>
        <span className={styles.label}>Crop view:</span>
        <button className={styles.expandBtn} onClick={onToggleExpand} title={expanded ? 'Collapse' : 'Expand'}>
          {expanded ? '▾' : '▴'}
        </button>
      </div>
      <div className={styles.thumbsWrap}>
        <div className={styles.thumbs}>
          {lenses.map((lens, i) => (
            <CropThumb
              key={i}
              lens={lens}
              orientation={orientation}
              color={LENS_COLORS[i]}
              lensIndex={i}
              isActive={activeLens === i}
              onSelect={() => onSelectLens(i)}
              offset={offsets[i] ?? { dx: 0, dy: 0 }}
              cleanCanvasRef={cleanCanvasRef}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
