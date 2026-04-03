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

const HISTOGRAM_MODES: { key: ViewMode; label: string }[] = [
  { key: 'luminance', label: 'Luminance' },
  { key: 'rgb', label: 'RGB Overlay' },
  { key: 'channels', label: 'All Channels' },
]

function ControlsPanel({ hist, clip, onFile }: {
  hist: HistogramData | null
  clip: ClipInfo | null
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

/** A single histogram canvas with a label */
function HistogramCard({ hist, mode, label }: {
  hist: HistogramData
  mode: ViewMode
  label: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    if (canvasRef.current) {
      drawHistogram(canvasRef.current, hist, mode)
    }
  }, [hist, mode])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const observer = new ResizeObserver(() => draw())
    observer.observe(el)
    return () => observer.disconnect()
  }, [draw])

  return (
    <div className={styles.histCard}>
      <div className={styles.histLabel}>{label}</div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label={`${label} histogram`}
        role="img"
      />
      <div className={styles.regionLabels}>
        <span>Shadows</span>
        <span>Midtones</span>
        <span>Highlights</span>
      </div>
    </div>
  )
}

export function HistogramExplainer() {
  const [hist, setHist] = useState<HistogramData | null>(null)
  const [clip, setClip] = useState<ClipInfo | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

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
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
    }
    img.src = url
  }, [])

  const controlsProps = { hist, clip, onFile: handleFile }

  return (
    <div className={styles.app}>
      <div className={styles.appBody}>
        <div className={styles.sidebar}>
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={styles.main}>
          {hist ? (
            <>
              {imageUrl && (
                <div className={styles.imagePreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Uploaded photo" className={styles.previewImg} />
                </div>
              )}
              <div className={styles.histogramGrid}>
                {HISTOGRAM_MODES.map((m) => (
                  <HistogramCard key={m.key} hist={hist} mode={m.key} label={m.label} />
                ))}
              </div>
            </>
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
