'use client'

import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { SUBJECTS, getVerdict } from './shutter-data'
import ss from './ShutterSpeedGuide.module.css'

export function MotionCanvas({ shutterSpeed }: { shutterSpeed: number }) {
  const t = useTranslations('toolUI.shutter-speed-visualizer')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const subjectLabels = useMemo(() => SUBJECTS.map((s) => t(s.key)), [t])
  const stationaryLabel = t('stationary')
  const verdictLabels = useMemo(() => ({
    verdictFrozen: t('verdictFrozen'),
    verdictMostlySharp: t('verdictMostlySharp'),
    verdictSlightBlur: t('verdictSlightBlur'),
    verdictMotionBlur: t('verdictMotionBlur'),
  }), [t])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const dpr = window.devicePixelRatio || 1
    const rowH = h / (SUBJECTS.length + 0.5)
    const topPad = rowH * 0.25

    ctx.clearRect(0, 0, w, h)
    const blurScale = w * 0.12

    for (let si = 0; si < SUBJECTS.length; si++) {
      const subject = SUBJECTS[si]
      const cy = topPad + (si + 0.5) * rowH
      const subjectX = w * 0.42
      const motionFt = subject.speed * shutterSpeed
      const blurPx = Math.min(motionFt * blurScale, w * 0.5)

      if (si > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
        ctx.lineWidth = 1 * dpr
        ctx.beginPath()
        ctx.moveTo(0, topPad + si * rowH)
        ctx.lineTo(w, topPad + si * rowH)
        ctx.stroke()
      }

      ctx.font = `500 ${12 * dpr}px system-ui, sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(subjectLabels[si], 12 * dpr, cy - 6 * dpr)

      ctx.font = `400 ${10 * dpr}px system-ui, sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.fillText(
        subject.speed === 0 ? stationaryLabel : `~${subject.speed} ft/s`,
        12 * dpr, cy + 8 * dpr,
      )

      const bodyRadius = Math.min(rowH * 0.22, 14 * dpr)

      if (blurPx < 2 * dpr) {
        ctx.fillStyle = subject.color
        ctx.beginPath()
        ctx.arc(subjectX, cy, bodyRadius, 0, Math.PI * 2)
        ctx.fill()
      } else {
        const halfBlur = blurPx / 2
        const grad = ctx.createLinearGradient(subjectX - halfBlur, cy, subjectX + halfBlur, cy)
        grad.addColorStop(0, 'transparent')
        grad.addColorStop(0.15, subject.color + '30')
        grad.addColorStop(0.5, subject.color + 'bb')
        grad.addColorStop(0.85, subject.color + '30')
        grad.addColorStop(1, 'transparent')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.ellipse(subjectX, cy, halfBlur, bodyRadius * 1.1, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = subject.color
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(subjectX, cy, bodyRadius * 0.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      const verdict = getVerdict(subject.speed, shutterSpeed)
      ctx.font = `600 ${11 * dpr}px system-ui, sans-serif`
      ctx.fillStyle = verdict.color
      ctx.textAlign = 'right'
      ctx.fillText(verdictLabels[verdict.key as keyof typeof verdictLabels], w - 12 * dpr, cy)
    }
  }, [shutterSpeed, subjectLabels, stationaryLabel, verdictLabels])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      draw()
    })
    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [draw])

  useEffect(() => { draw() }, [draw])

  return (
    <canvas ref={canvasRef} className={ss.motionCanvas} aria-label={t('motionBlurAriaLabel')} role="img" />
  )
}
