'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { formatShutterSpeed } from '@/lib/math/exposure'
import { getToolBySlug } from '@/lib/data/tools'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import calc from '@/components/shared/Calculator.module.css'
import ss from './ShutterSpeedGuide.module.css'

/* ─── Shutter speed presets (seconds) ─── */
const SHUTTER_PRESETS = [
  { value: 2, label: '2s' },
  { value: 1, label: '1s' },
  { value: 0.5, label: '1/2' },
  { value: 0.25, label: '1/4' },
  { value: 1 / 8, label: '1/8' },
  { value: 1 / 15, label: '1/15' },
  { value: 1 / 30, label: '1/30' },
  { value: 1 / 60, label: '1/60' },
  { value: 1 / 125, label: '1/125' },
  { value: 1 / 250, label: '1/250' },
  { value: 1 / 500, label: '1/500' },
  { value: 1 / 1000, label: '1/1000' },
  { value: 1 / 2000, label: '1/2000' },
  { value: 1 / 4000, label: '1/4000' },
]

/* ─── Subject definitions ─── */
interface Subject {
  label: string
  speed: number // feet per second
  color: string
}

const SUBJECTS: Subject[] = [
  { label: 'Standing person', speed: 0, color: '#10b981' },
  { label: 'Slow walk', speed: 4, color: '#3b82f6' },
  { label: 'Jogging', speed: 10, color: '#8b5cf6' },
  { label: 'Running', speed: 20, color: '#f59e0b' },
  { label: 'Cyclist', speed: 35, color: '#ef4444' },
  { label: 'Birds in flight', speed: 50, color: '#ec4899' },
  { label: 'Car (city)', speed: 60, color: '#a855f7' },
  { label: 'F1 car', speed: 330, color: '#f43f5e' },
  { label: 'Airplane (landing)', speed: 370, color: '#06b6d4' },
]

const tool = getToolBySlug('shutter-speed-visualizer')!

/* ─── Verdict logic ─── */
function getVerdict(speed: number, shutterSpeed: number): { label: string; color: string } {
  if (speed === 0) return { label: 'Frozen', color: '#10b981' }
  const motionFt = speed * shutterSpeed
  if (motionFt < 0.02) return { label: 'Frozen', color: '#10b981' }
  if (motionFt < 0.1) return { label: 'Mostly sharp', color: '#3b82f6' }
  if (motionFt < 0.5) return { label: 'Slight blur', color: '#f59e0b' }
  return { label: 'Motion blur', color: '#ef4444' }
}

/* ─── Motion blur canvas ─── */
function MotionCanvas({ shutterSpeed }: { shutterSpeed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

      // Row separator
      if (si > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
        ctx.lineWidth = 1 * dpr
        ctx.beginPath()
        ctx.moveTo(0, topPad + si * rowH)
        ctx.lineTo(w, topPad + si * rowH)
        ctx.stroke()
      }

      // Label (left)
      ctx.font = `500 ${12 * dpr}px system-ui, sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(subject.label, 12 * dpr, cy - 6 * dpr)

      // Speed sublabel
      ctx.font = `400 ${10 * dpr}px system-ui, sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.fillText(
        subject.speed === 0 ? 'stationary' : `~${subject.speed} ft/s`,
        12 * dpr,
        cy + 8 * dpr,
      )

      const bodyRadius = Math.min(rowH * 0.22, 14 * dpr)

      if (blurPx < 2 * dpr) {
        // Sharp circle
        ctx.fillStyle = subject.color
        ctx.beginPath()
        ctx.arc(subjectX, cy, bodyRadius, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Motion blur trail
        const halfBlur = blurPx / 2
        const grad = ctx.createLinearGradient(
          subjectX - halfBlur, cy,
          subjectX + halfBlur, cy,
        )
        grad.addColorStop(0, 'transparent')
        grad.addColorStop(0.15, subject.color + '30')
        grad.addColorStop(0.5, subject.color + 'bb')
        grad.addColorStop(0.85, subject.color + '30')
        grad.addColorStop(1, 'transparent')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.ellipse(subjectX, cy, halfBlur, bodyRadius * 1.1, 0, 0, Math.PI * 2)
        ctx.fill()

        // Brighter core
        ctx.fillStyle = subject.color
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(subjectX, cy, bodyRadius * 0.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Verdict (right)
      const verdict = getVerdict(subject.speed, shutterSpeed)
      ctx.font = `600 ${11 * dpr}px system-ui, sans-serif`
      ctx.fillStyle = verdict.color
      ctx.textAlign = 'right'
      ctx.fillText(verdict.label, w - 12 * dpr, cy)
    }
  }, [shutterSpeed])

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
    <canvas
      ref={canvasRef}
      className={ss.motionCanvas}
      aria-label="Motion blur visualization for different subjects"
      role="img"
    />
  )
}

/* ─── Controls Panel ─── */
function ControlsPanel({ shutterIdx, onShutterChange }: {
  shutterIdx: number
  onShutterChange: (idx: number) => void
}) {
  const preset = SHUTTER_PRESETS[shutterIdx]
  return (
    <>
      <div className={ss.header}>
        <h1 className={ss.title}>{tool.name}</h1>
        <p className={ss.description}>See how shutter speed affects motion blur for different subjects.</p>
      </div>

      <div className={calc.field}>
        <label className={calc.label}>Shutter Speed</label>
        <div className={ss.shutterValue}>{preset.label}</div>
        <input
          type="range"
          className={ss.slider}
          min={0}
          max={SHUTTER_PRESETS.length - 1}
          value={shutterIdx}
          onChange={(e) => onShutterChange(Number(e.target.value))}
          aria-label="Shutter speed"
          aria-valuetext={preset.label}
        />
        <div className={ss.sliderLabels}>
          <span>Slow (2s)</span>
          <span>Fast (1/4000)</span>
        </div>
      </div>

      <div className={ss.presets}>
        {SHUTTER_PRESETS.map((p, i) => (
          <button
            key={p.label}
            className={`${ss.preset} ${shutterIdx === i ? ss.presetActive : ''}`}
            onClick={() => onShutterChange(i)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={ss.resultCard}>
        <span className={ss.resultCaption}>Selected Speed</span>
        <span className={ss.resultBig}>{formatShutterSpeed(preset.value)}</span>
      </div>
    </>
  )
}

/* ─── Main component ─── */
export function ShutterSpeedGuide() {
  const [shutterIdx, setShutterIdx] = useState(8) // default 1/125

  return (
    <div className={ss.app}>
      <div className={ss.appBody}>
        <div className={ss.sidebar}>
          <ToolActions toolName="Shutter Speed Visualizer" toolSlug="shutter-speed-visualizer" />
          <ControlsPanel shutterIdx={shutterIdx} onShutterChange={setShutterIdx} />
        </div>

        <div className={ss.main}>
          <MotionCanvas shutterSpeed={SHUTTER_PRESETS[shutterIdx].value} />
        </div>

        <div className={ss.desktopOnly}>
          <LearnPanel slug="shutter-speed-visualizer" />
        </div>
      </div>

      <div className={ss.mobileControls}>
        <ControlsPanel shutterIdx={shutterIdx} onShutterChange={setShutterIdx} />
      </div>

      <div className={ss.mobileOnly}>
        <LearnPanel slug="shutter-speed-visualizer" />
      </div>
    </div>
  )
}
