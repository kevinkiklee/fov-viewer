'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import type { HistogramData } from '@/lib/math/histogram'
import { drawHistogram, type ViewMode } from './drawHistogram'
import styles from './HistogramExplainer.module.css'

export function HistogramCard({ hist, mode, label }: {
  hist: HistogramData
  mode: ViewMode
  label: string
}) {
  const t = useTranslations('toolUI.histogram')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    if (canvasRef.current) drawHistogram(canvasRef.current, hist, mode)
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
      <canvas ref={canvasRef} className={styles.canvas} aria-label={`${label} histogram`} role="img" />
      <div className={styles.regionLabels}>
        <span>{t('shadows')}</span>
        <span>{t('midtones')}</span>
        <span>{t('highlights')}</span>
      </div>
    </div>
  )
}
