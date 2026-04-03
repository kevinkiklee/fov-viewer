'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { FileDropZone } from '@/components/shared/FileDropZone'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { getToolBySlug } from '@/lib/data/tools'
import { computeHistogram, detectClipping } from '@/lib/math/histogram'
import type { HistogramData } from '@/lib/math/histogram'
import styles from './HistogramExplainer.module.css'

type ViewMode = 'luminance' | 'rgb' | 'channels'

interface ClipInfo {
  hasBlackClip: boolean
  hasWhiteClip: boolean
  blackClipPercent: number
  whiteClipPercent: number
}

function drawHistogram(
  canvas: HTMLCanvasElement,
  hist: HistogramData,
  mode: ViewMode,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const w = rect.width
  const h = rect.height
  ctx.clearRect(0, 0, w, h)

  const barWidth = w / 256

  function drawChannel(data: number[], color: string, alpha: number) {
    const max = Math.max(...data)
    if (max === 0 || !ctx) return
    ctx.fillStyle = color
    ctx.globalAlpha = alpha
    for (let i = 0; i < 256; i++) {
      const barHeight = (data[i] / max) * h
      ctx.fillRect(i * barWidth, h - barHeight, barWidth + 0.5, barHeight)
    }
    ctx.globalAlpha = 1
  }

  if (mode === 'luminance') {
    drawChannel(hist.luma, '#e0e0e0', 0.8)
  } else if (mode === 'rgb') {
    drawChannel(hist.r, '#ef4444', 0.4)
    drawChannel(hist.g, '#22c55e', 0.4)
    drawChannel(hist.b, '#3b82f6', 0.4)
  } else {
    drawChannel(hist.r, '#ef4444', 0.6)
    drawChannel(hist.g, '#22c55e', 0.6)
    drawChannel(hist.b, '#3b82f6', 0.6)
    drawChannel(hist.luma, '#e0e0e0', 0.3)
  }
}

const tool = getToolBySlug('histogram')!

const modes: { key: ViewMode; label: string }[] = [
  { key: 'luminance', label: 'Luminance' },
  { key: 'rgb', label: 'RGB Overlay' },
  { key: 'channels', label: 'All Channels' },
]

function ControlsPanel({ hist, clip, mode, onModeChange, onFile }: {
  hist: HistogramData | null
  clip: ClipInfo | null
  mode: ViewMode
  onModeChange: (m: ViewMode) => void
  onFile: (file: File) => void
}) {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>{tool.name}</h1>
        <p className={styles.description}>{tool.description}</p>
      </div>

      <FileDropZone onFile={onFile} />

      {hist && (
        <>
          <div className={styles.tabs}>
            {modes.map((m) => (
              <button
                key={m.key}
                className={`${styles.tab} ${mode === m.key ? styles.tabActive : ''}`}
                onClick={() => onModeChange(m.key)}
                aria-pressed={mode === m.key}
              >
                {m.label}
              </button>
            ))}
          </div>

          {(clip?.hasBlackClip || clip?.hasWhiteClip) && (
            <div className={styles.annotations}>
              {clip?.hasBlackClip && (
                <div className={styles.warning}>
                  Black clipping detected &mdash; {clip.blackClipPercent.toFixed(1)}% of pixels are pure black
                </div>
              )}
              {clip?.hasWhiteClip && (
                <div className={styles.warning}>
                  White clipping detected &mdash; {clip.whiteClipPercent.toFixed(1)}% of pixels are pure white
                </div>
              )}
            </div>
          )}

          <div className={styles.explanation}>
            A histogram shows the distribution of brightness in your photo. Peaks on the left indicate
            dark areas, peaks on the right indicate bright areas. A well-exposed photo typically has a
            spread across the full range without heavy clipping at either end.
          </div>
        </>
      )}
    </>
  )
}

export function HistogramExplainer() {
  const [hist, setHist] = useState<HistogramData | null>(null)
  const [clip, setClip] = useState<ClipInfo | null>(null)
  const [mode, setMode] = useState<ViewMode>('luminance')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFile = useCallback((file: File) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const histogram = computeHistogram(imageData.data, canvas.width, canvas.height)
      const clipping = detectClipping(histogram)
      setHist(histogram)
      setClip(clipping)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [])

  useEffect(() => {
    if (hist && canvasRef.current) {
      drawHistogram(canvasRef.current, hist, mode)
    }
  }, [hist, mode])

  useEffect(() => {
    if (!hist || !canvasRef.current) return
    const observer = new ResizeObserver(() => {
      if (canvasRef.current && hist) {
        drawHistogram(canvasRef.current, hist, mode)
      }
    })
    observer.observe(canvasRef.current)
    return () => observer.disconnect()
  }, [hist, mode])

  const controlsProps = { hist, clip, mode, onModeChange: setMode, onFile: handleFile }

  return (
    <div className={styles.app}>
      <div className={styles.appBody}>
        <div className={styles.sidebar}>
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={styles.main}>
          {hist ? (
            <div className={styles.canvasWrap}>
              <canvas ref={canvasRef} className={styles.canvas} aria-label={`Histogram showing ${mode} channel distribution`} role="img" />
              <div className={styles.regionLabels}>
                <span>Shadows</span>
                <span>Midtones</span>
                <span>Highlights</span>
              </div>
            </div>
          ) : (
            <div className={styles.emptyMain}>Upload an image to see its histogram</div>
          )}
        </div>

        <LearnPanel slug="histogram" />
      </div>

      <div className={styles.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>
    </div>
  )
}
