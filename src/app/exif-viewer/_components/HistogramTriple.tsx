'use client'

import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react'
import { useTranslations } from 'next-intl'
import { computeHistogram } from '@/lib/math/histogram'
import type { HistogramData } from '@/lib/math/histogram'
import styles from './ExifViewer.module.css'

function drawSingleHistogram(
  canvas: HTMLCanvasElement,
  hist: HistogramData,
  mode: 'luminance' | 'red' | 'green' | 'blue',
) {
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  const barW = w / 256 + 0.5
  const config: Record<string, { data: number[]; color: string }> = {
    luminance: { data: hist.luma, color: 'rgba(255, 255, 255, 0.35)' },
    red: { data: hist.r, color: 'rgba(239, 68, 68, 0.5)' },
    green: { data: hist.g, color: 'rgba(34, 197, 94, 0.5)' },
    blue: { data: hist.b, color: 'rgba(59, 130, 246, 0.5)' },
  }
  const { data, color } = config[mode]
  const max = Math.max(...data.slice(1, 255))
  if (max === 0) return
  ctx.fillStyle = color
  for (let i = 0; i < 256; i++) {
    const bh = (data[i] / max) * h
    ctx.fillRect((i / 255) * w, h - bh, barW, bh)
  }
}

export interface HistogramTripleHandle {
  getCanvases(): (HTMLCanvasElement | null)[]
}

export const HistogramTriple = forwardRef<HistogramTripleHandle, { imageUrl: string }>(function HistogramTriple({ imageUrl }, ref) {
  const t = useTranslations('toolUI.exif-viewer')
  const lumaRef = useRef<HTMLCanvasElement>(null)
  const redRef = useRef<HTMLCanvasElement>(null)
  const greenRef = useRef<HTMLCanvasElement>(null)
  const blueRef = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => ({
    getCanvases: () => [lumaRef.current, redRef.current, greenRef.current, blueRef.current],
  }))

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const offscreen = document.createElement('canvas')
      const maxDim = 400
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
      offscreen.width = Math.round(img.width * scale)
      offscreen.height = Math.round(img.height * scale)
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true })
      if (!offCtx) return
      offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height)
      const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height)
      const hist = computeHistogram(imageData.data, offscreen.width, offscreen.height)

      if (lumaRef.current) drawSingleHistogram(lumaRef.current, hist, 'luminance')
      if (redRef.current) drawSingleHistogram(redRef.current, hist, 'red')
      if (greenRef.current) drawSingleHistogram(greenRef.current, hist, 'green')
      if (blueRef.current) drawSingleHistogram(blueRef.current, hist, 'blue')
    }
    img.src = imageUrl
  }, [imageUrl])

  return (
    <div className={styles.histogramRow}>
      <div className={styles.histogramPanel}>
        <div className={styles.histogramTitle}>{t('luminance')}</div>
        <canvas ref={lumaRef} className={styles.histogramCanvas} />
        <div className={styles.histogramLabels}><span>{t('shadows')}</span><span>{t('highlights')}</span></div>
      </div>
      <div className={styles.histogramPanel}>
        <div className={styles.histogramTitle}>{t('red')}</div>
        <canvas ref={redRef} className={styles.histogramCanvas} />
        <div className={styles.histogramLabels}><span>{t('shadows')}</span><span>{t('highlights')}</span></div>
      </div>
      <div className={styles.histogramPanel}>
        <div className={styles.histogramTitle}>{t('green')}</div>
        <canvas ref={greenRef} className={styles.histogramCanvas} />
        <div className={styles.histogramLabels}><span>{t('shadows')}</span><span>{t('highlights')}</span></div>
      </div>
      <div className={styles.histogramPanel}>
        <div className={styles.histogramTitle}>{t('blueLabel')}</div>
        <canvas ref={blueRef} className={styles.histogramCanvas} />
        <div className={styles.histogramLabels}><span>{t('shadows')}</span><span>{t('highlights')}</span></div>
      </div>
    </div>
  )
})
