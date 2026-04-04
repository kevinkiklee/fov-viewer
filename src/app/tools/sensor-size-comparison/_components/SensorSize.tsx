'use client'

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import { getToolBySlug } from '@/lib/data/tools'
import ss from './SensorSize.module.css'
import { pixelPitch } from '@/lib/math/diffraction'
import { useQueryInit, useToolQuerySync, strParam, intParam } from '@/lib/utils/querySync'
import { SENSORS, POPULAR_MODELS, COMMON_MP, type MpEntry } from '@/lib/data/sensors'
import type { SensorPreset } from '@/lib/types'

type DisplayMode = 'overlay' | 'side-by-side' | 'pixel-density'

const FF_DIAG = Math.sqrt(36 * 36 + 24 * 24)

const ALL_SENSOR_IDS = SENSORS.map((s) => s.id) as unknown as string[]
const ALL_SENSOR_ID_SET = new Set(ALL_SENSOR_IDS)
const DEFAULT_VISIBLE_IDS = ['mf', 'ff', 'apsc_n', 'm43', 'phone']
const DEFAULT_VISIBLE = DEFAULT_VISIBLE_IDS.join('+')

const PARAM_SCHEMA = {
  show: {
    default: DEFAULT_VISIBLE,
    parse: (raw: string) => {
      // Support both + and , as separators for backwards compat
      const ids = raw.split(/[+,]/).filter((id) => ALL_SENSOR_ID_SET.has(id))
      return ids.length > 0 ? ids.join('+') : undefined
    },
    serialize: (v: string) => v,
  },
  mode: strParam<DisplayMode>('overlay', ['overlay', 'side-by-side', 'pixel-density'] as const),
  mp: intParam(24, 1, 200),
}

function rgba(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${a})`
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

const tool = getToolBySlug('sensor-size')

function ControlsPanel({
  visible, mode, resolution, onToggleSensor, onModeChange, onResolutionChange,
}: {
  visible: Set<string>
  mode: DisplayMode
  resolution: number
  onToggleSensor: (id: string) => void
  onModeChange: (m: DisplayMode) => void
  onResolutionChange: (v: number) => void
}) {
  return (
    <>
      <div className={ss.sectionLabel}>Sensors</div>
      <div className={ss.checkboxes}>
        {SENSORS.map((s) => (
          <label key={s.id} className={ss.checkLabel}>
            <input
              type="checkbox"
              checked={visible.has(s.id)}
              onChange={() => onToggleSensor(s.id)}
            />
            <span className={ss.checkDot} style={{ backgroundColor: s.color }} />
            <span className={ss.checkName}>{s.name}</span>
            <span className={ss.checkOutline} />
          </label>
        ))}
      </div>

      <div className={ss.sectionLabel}>Display Mode</div>
      <div className={ss.modeToggle}>
        {(['overlay', 'side-by-side', 'pixel-density'] as const).map((m) => (
          <button
            key={m}
            className={`${ss.modeBtn} ${mode === m ? ss.modeBtnActive : ''}`}
            onClick={() => onModeChange(m)}
            aria-pressed={mode === m}
          >
            {m === 'overlay' ? 'Overlay' : m === 'side-by-side' ? 'Side by Side' : 'Pixel Density'}
          </button>
        ))}
      </div>

      {mode === 'pixel-density' && (
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Showing common megapixel counts for each sensor. Larger pixels (bigger cells) capture more light.
        </p>
      )}
    </>
  )
}

// Animation duration in ms
const ANIM_DURATION = 300

// Easing: ease-out cubic
function easeOut(t: number): number {
  return 1 - (1 - t) ** 3
}

export function SensorSize() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState<Set<string>>(() => new Set(DEFAULT_VISIBLE_IDS))
  const [mode, setMode] = useState<DisplayMode>('overlay')
  const [resolution, setResolution] = useState(24)

  // Animation state: maps sensor id → { progress: 0..1, direction: 'in' | 'out', startTime }
  const animRef = useRef<Map<string, { progress: number; direction: 'in' | 'out'; startTime: number }>>(new Map())
  const rafRef = useRef<number>(0)
  const prevVisibleRef = useRef<Set<string>>(new Set(DEFAULT_VISIBLE_IDS))

  useQueryInit(PARAM_SCHEMA, {
    show: (v: string) => setVisible(new Set(v.split(/[+,]/))),
    mode: setMode,
    mp: setResolution,
  })
  useToolQuerySync(
    { show: Array.from(visible).join('+'), mode, mp: resolution },
    PARAM_SCHEMA,
  )

  const visibleSensors = SENSORS.filter((s) => visible.has(s.id)) as Required<SensorPreset>[]

  const toggleSensor = useCallback((id: string) => {
    setVisible((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Detect added/removed sensors and start animations
  useEffect(() => {
    const prev = prevVisibleRef.current
    const now = performance.now()

    // Newly added
    for (const id of visible) {
      if (!prev.has(id)) {
        animRef.current.set(id, { progress: 0, direction: 'in', startTime: now })
      }
    }
    // Newly removed
    for (const id of prev) {
      if (!visible.has(id)) {
        animRef.current.set(id, { progress: 1, direction: 'out', startTime: now })
      }
    }

    prevVisibleRef.current = new Set(visible)
  }, [visible])

  // All sensors currently rendering (visible + animating out)
  const getRenderSensors = useCallback((): { sensors: Required<SensorPreset>[]; alphaMap: Map<string, number> } => {
    const alphaMap = new Map<string, number>()
    const ids = new Set(visible)

    // Include sensors animating out
    for (const [id, anim] of animRef.current) {
      if (anim.direction === 'out' && anim.progress > 0) {
        ids.add(id)
      }
    }

    const sensors = SENSORS.filter((s) => ids.has(s.id)) as Required<SensorPreset>[]

    for (const s of sensors) {
      const anim = animRef.current.get(s.id)
      if (anim) {
        alphaMap.set(s.id, anim.direction === 'in' ? anim.progress : anim.progress)
      } else {
        alphaMap.set(s.id, 1)
      }
    }

    return { sensors, alphaMap }
  }, [visible])

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const cssWidth = canvas.clientWidth
    const cssHeight = canvas.clientHeight || 420
    canvas.width = cssWidth * dpr
    canvas.height = cssHeight * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, cssWidth, cssHeight)

    // Update animation progress
    const now = performance.now()
    let animating = false
    for (const [id, anim] of animRef.current) {
      const elapsed = now - anim.startTime
      const t = Math.min(elapsed / ANIM_DURATION, 1)
      const eased = easeOut(t)

      if (anim.direction === 'in') {
        anim.progress = eased
      } else {
        anim.progress = 1 - eased
      }

      if (t < 1) {
        animating = true
      } else {
        // Animation complete — clean up
        if (anim.direction === 'in') {
          animRef.current.delete(id) // fully visible, no need to track
        }
        // 'out' with progress 0 will be cleaned after this frame
      }
    }

    // Clean up completed out-animations
    for (const [id, anim] of animRef.current) {
      if (anim.direction === 'out' && anim.progress <= 0) {
        animRef.current.delete(id)
      }
    }

    const { sensors, alphaMap } = getRenderSensors()
    if (sensors.length === 0) return

    const padding = 30

    if (mode === 'overlay') {
      drawOverlay(ctx, cssWidth, cssHeight, padding, sensors, alphaMap)
    } else if (mode === 'side-by-side') {
      drawSideBySide(ctx, cssWidth, cssHeight, padding, sensors, alphaMap)
    } else {
      drawPixelDensity(ctx, cssWidth, cssHeight, padding, sensors, resolution, alphaMap)
    }

    if (animating) {
      rafRef.current = requestAnimationFrame(drawFrame)
    }
  }, [mode, resolution, getRenderSensors])

  // Redraw when dependencies change
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(drawFrame)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [drawFrame])

  // Kick off animation loop when visible changes
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(drawFrame)
  }, [visible, drawFrame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(drawFrame)
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [drawFrame])

  const controlsProps = {
    visible, mode, resolution,
    onToggleSensor: toggleSensor,
    onModeChange: setMode,
    onResolutionChange: setResolution,
  }

  return (
    <div className={ss.app}>
      <div className={ss.appBody}>
        <div className={ss.sidebar}>
          <ToolActions toolName="Sensor Size Comparison" toolSlug="sensor-size" canvasRef={canvasRef} imageFilename="sensor-comparison.png" />
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={ss.main}>
          <canvas
            ref={canvasRef}
            className={ss.canvas}
            style={{ width: '100%', flex: 1, minHeight: 300 }}
            aria-label={`Sensor size comparison in ${mode} mode`}
            role="img"
          />

          <div className={ss.tableWrap}>
            <table className={ss.table}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Sensor</th>
                  <th>Width (mm)</th>
                  <th>Height (mm)</th>
                  <th>Area (mm²)</th>
                  <th>Crop Factor</th>
                </tr>
              </thead>
              <tbody>
                {visibleSensors.map((s) => {
                  const area = s.w * s.h
                  const diag = Math.sqrt(s.w * s.w + s.h * s.h)
                  const crop = FF_DIAG / diag
                  return (
                    <tr key={s.id}>
                      <td style={{ textAlign: 'left' }}>
                        <div className={ss.sensorCell}>
                          <span className={ss.tableDot} style={{ backgroundColor: s.color }} />
                          {s.name}
                        </div>
                      </td>
                      <td>{s.w}</td>
                      <td>{s.h}</td>
                      <td>{area.toFixed(1)}</td>
                      <td>{crop.toFixed(2)}x</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <LearnPanel slug="sensor-size" />
      </div>

      <div className={ss.mobileControls}>
        <ControlsPanel {...controlsProps} />
      </div>
    </div>
  )
}

// ── Drawing functions ──

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, pad: number,
  sensors: Required<SensorPreset>[],
  alphaMap?: Map<string, number>,
) {
  const maxW = Math.max(...sensors.map((s) => s.w))
  const maxH = Math.max(...sensors.map((s) => s.h))
  const labelColumnW = 160 // space for label pills on the left
  const dimAnnotationH = 40 // space for dimension line below
  const dimAnnotationW = 30 // space for dimension line on right
  const availW = W - pad * 2 - labelColumnW - dimAnnotationW
  const availH = H - pad * 2 - dimAnnotationH
  const scale = Math.min(availW / maxW, availH / maxH)
  const cx = pad + labelColumnW + availW / 2
  const cy = pad + availH / 2

  const sorted = [...sensors].sort((a, b) => b.w * b.h - a.w * a.h)

  // Draw all rects first (fills + strokes)
  for (const s of sorted) {
    const a = alphaMap?.get(s.id) ?? 1
    const rw = s.w * scale
    const rh = s.h * scale
    const x = cx - rw / 2
    const y = cy - rh / 2
    const r = Math.min(4, rw * 0.02)

    ctx.save()
    ctx.globalAlpha = a

    roundRect(ctx, x, y, rw, rh, r)
    ctx.fillStyle = rgba(s.color, 0.08)
    ctx.fill()

    roundRect(ctx, x, y, rw, rh, r)
    ctx.strokeStyle = rgba(s.color, 0.7)
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.restore()
  }

  // Draw labels as a column to the left of the sensor rects
  const pillH = 18
  const labelGap = 4
  ctx.font = '11px system-ui, sans-serif'

  // Evenly space labels vertically, centered on the graphic
  const totalLabelH = sorted.length * pillH + (sorted.length - 1) * labelGap
  let labelY = cy - totalLabelH / 2

  // Find the widest pill to right-align all pills to the same column edge
  const pillWidths = sorted.map(s => ctx.measureText(s.name).width + 10)
  const maxPillW = Math.max(...pillWidths)
  const largestRectLeft = cx - sorted[0].w * scale / 2
  const columnRight = largestRectLeft - 20 // fixed gap from largest rect left edge

  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i]
    const a = alphaMap?.get(s.id) ?? 1
    const rw = s.w * scale
    const rectLeft = cx - rw / 2
    const label = s.name
    const pillW = pillWidths[i]
    const pillX = columnRight - pillW // right-align all pills
    const pillCenterY = labelY + pillH / 2

    ctx.save()
    ctx.globalAlpha = a

    // Leader line from pill to rect left edge
    ctx.beginPath()
    ctx.moveTo(columnRight + 4, pillCenterY)
    ctx.lineTo(rectLeft, pillCenterY)
    ctx.strokeStyle = rgba(s.color, 0.25)
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    ctx.stroke()
    ctx.setLineDash([])

    // Small dot at rect edge
    ctx.beginPath()
    ctx.arc(rectLeft, pillCenterY, 2, 0, Math.PI * 2)
    ctx.fillStyle = rgba(s.color, 0.5)
    ctx.fill()

    // Pill background
    roundRect(ctx, pillX, labelY, pillW, pillH, 3)
    ctx.fillStyle = rgba(s.color, 0.15)
    ctx.fill()

    // Label text
    ctx.fillStyle = s.color
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, pillX + 5, pillCenterY)

    ctx.restore()

    labelY += pillH + labelGap
  }

  const largest = sorted[0]
  const lw = largest.w * scale
  const lh = largest.h * scale
  const lx = cx - lw / 2
  const ly = cy - lh / 2

  ctx.strokeStyle = rgba(largest.color, 0.3)
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])

  const dimY = ly + lh + 16
  ctx.beginPath()
  ctx.moveTo(lx, dimY)
  ctx.lineTo(lx + lw, dimY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(lx, dimY - 4)
  ctx.lineTo(lx, dimY + 4)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(lx + lw, dimY - 4)
  ctx.lineTo(lx + lw, dimY + 4)
  ctx.stroke()

  ctx.setLineDash([])
  ctx.fillStyle = rgba(largest.color, 0.5)
  ctx.font = '10px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`${largest.w} mm`, cx, dimY + 4)

  const dimX = lx + lw + 16
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.moveTo(dimX, ly)
  ctx.lineTo(dimX, ly + lh)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(dimX - 4, ly)
  ctx.lineTo(dimX + 4, ly)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(dimX - 4, ly + lh)
  ctx.lineTo(dimX + 4, ly + lh)
  ctx.stroke()

  ctx.setLineDash([])
  ctx.save()
  ctx.translate(dimX + 6, cy)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText(`${largest.h} mm`, 0, 0)
  ctx.restore()

  ctx.textBaseline = 'alphabetic'
}

function drawSideBySideRow(
  ctx: CanvasRenderingContext2D,
  W: number, pad: number,
  sensors: Required<SensorPreset>[],
  scale: number,
  baseY: number,
  alphaMap?: Map<string, number>,
) {
  const gap = 16

  ctx.font = '10px system-ui, sans-serif'
  const minTextWidths = sensors.map(s => {
    const nameLabel = s.name.length > 14 ? s.name.replace(' (', '\n(') : s.name
    const nameW = Math.max(...nameLabel.split('\n').map(l => ctx.measureText(l).width))
    ctx.font = '9px system-ui, sans-serif'
    const models = POPULAR_MODELS[s.id] ?? []
    const modelW = models.length > 0 ? Math.max(...models.map(m => ctx.measureText(m).width)) : 0
    ctx.font = '10px system-ui, sans-serif'
    return Math.max(nameW, modelW) + 8
  })

  const colWidths = sensors.map((s, i) => Math.max(s.w * scale, minTextWidths[i]))
  const totalGap = (sensors.length - 1) * gap
  const totalColW = colWidths.reduce((a, b) => a + b, 0) + totalGap
  let x = (W - totalColW) / 2

  for (let si = 0; si < sensors.length; si++) {
    const s = sensors[si]
    const a = alphaMap?.get(s.id) ?? 1
    const colW = colWidths[si]
    const rw = s.w * scale
    const rh = s.h * scale
    const r = Math.min(4, rw * 0.03)
    const colCx = x + colW / 2
    const rx = colCx - rw / 2
    const ry = baseY - rh

    ctx.save()
    ctx.globalAlpha = a

    roundRect(ctx, rx, ry, rw, rh, r)
    ctx.fillStyle = rgba(s.color, 0.12)
    ctx.fill()

    roundRect(ctx, rx, ry, rw, rh, r)
    ctx.strokeStyle = rgba(s.color, 0.7)
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = rgba(s.color, 0.5)
    ctx.font = '9px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    if (rw > 40) {
      ctx.fillText(`${s.w}×${s.h}`, colCx, ry + rh - 4)
    }

    ctx.fillStyle = s.color
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const nameLabel = s.name.length > 14 ? s.name.replace(' (', '\n(') : s.name
    const lines = nameLabel.split('\n')
    lines.forEach((line, i) => {
      ctx.fillText(line, colCx, baseY + 6 + i * 13)
    })

    const models = POPULAR_MODELS[s.id] ?? []
    if (models.length > 0) {
      ctx.fillStyle = rgba(s.color, 0.45)
      ctx.font = '9px system-ui, sans-serif'
      const modelStartY = baseY + 6 + lines.length * 13 + 4
      for (let mi = 0; mi < models.length; mi++) {
        ctx.fillText(models[mi], colCx, modelStartY + mi * 12)
      }
    }

    ctx.restore()

    x += colW + gap
  }
}

function drawSideBySide(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, pad: number,
  sensors: Required<SensorPreset>[],
  alphaMap?: Map<string, number>,
) {
  const useRows = sensors.length > 5
  const gap = 16

  if (!useRows) {
    // Single row
    const maxModels = Math.max(...sensors.map(s => (POPULAR_MODELS[s.id] ?? []).length), 0)
    const labelSpace = 36 + maxModels * 12
    const maxH = Math.max(...sensors.map(s => s.h))

    ctx.font = '10px system-ui, sans-serif'
    const minTextWidths = sensors.map(s => {
      const nameLabel = s.name.length > 14 ? s.name.replace(' (', '\n(') : s.name
      const nameW = Math.max(...nameLabel.split('\n').map(l => ctx.measureText(l).width))
      ctx.font = '9px system-ui, sans-serif'
      const models = POPULAR_MODELS[s.id] ?? []
      const modelW = models.length > 0 ? Math.max(...models.map(m => ctx.measureText(m).width)) : 0
      ctx.font = '10px system-ui, sans-serif'
      return Math.max(nameW, modelW) + 8
    })

    const totalGap = (sensors.length - 1) * gap
    const availW = W - pad * 2 - totalGap
    const availH = H - pad * 2 - labelSpace

    let lo = 0, hi = availH / maxH
    for (let iter = 0; iter < 30; iter++) {
      const mid = (lo + hi) / 2
      const totalNeeded = sensors.reduce((sum, s, i) => sum + Math.max(s.w * mid, minTextWidths[i]), 0)
      if (totalNeeded <= availW) lo = mid
      else hi = mid
    }
    const scale = lo

    const tallestH = maxH * scale
    const groupH = tallestH + labelSpace
    const baseY = (H + groupH) / 2 - labelSpace

    drawSideBySideRow(ctx, W, pad, sensors, scale, baseY, alphaMap)
  } else {
    // Two rows: split sensors in half
    const mid = Math.ceil(sensors.length / 2)
    const row1 = sensors.slice(0, mid)
    const row2 = sensors.slice(mid)

    const rowGap = 20
    const maxModels = Math.max(...sensors.map(s => (POPULAR_MODELS[s.id] ?? []).length), 0)
    const labelSpace = 36 + maxModels * 12
    const maxH = Math.max(...sensors.map(s => s.h))

    // Compute scale that fits both rows
    ctx.font = '10px system-ui, sans-serif'
    const minTextWidths = sensors.map(s => {
      const nameLabel = s.name.length > 14 ? s.name.replace(' (', '\n(') : s.name
      const nameW = Math.max(...nameLabel.split('\n').map(l => ctx.measureText(l).width))
      ctx.font = '9px system-ui, sans-serif'
      const models = POPULAR_MODELS[s.id] ?? []
      const modelW = models.length > 0 ? Math.max(...models.map(m => ctx.measureText(m).width)) : 0
      ctx.font = '10px system-ui, sans-serif'
      return Math.max(nameW, modelW) + 8
    })

    const availH = (H - pad * 2 - rowGap - labelSpace * 2) / 2
    const maxRowLen = Math.max(row1.length, row2.length)
    const totalGap = (maxRowLen - 1) * gap
    const availW = W - pad * 2 - totalGap

    // Scale must fit the widest row and the available height
    let lo = 0, hi = availH / maxH
    for (let iter = 0; iter < 30; iter++) {
      const midScale = (lo + hi) / 2
      const row1Needed = row1.reduce((sum, s, i) => sum + Math.max(s.w * midScale, minTextWidths[i]), 0)
      const row2Needed = row2.reduce((sum, s, i) => sum + Math.max(s.w * midScale, minTextWidths[mid + i]), 0)
      if (Math.max(row1Needed, row2Needed) <= availW) lo = midScale
      else hi = midScale
    }
    const scale = lo

    const tallestH = maxH * scale
    const rowHeight = tallestH + labelSpace
    const totalHeight = rowHeight * 2 + rowGap
    const startY = (H - totalHeight) / 2

    const baseY1 = startY + tallestH
    const baseY2 = startY + rowHeight + rowGap + tallestH

    drawSideBySideRow(ctx, W, pad, row1, scale, baseY1, alphaMap)
    drawSideBySideRow(ctx, W, pad, row2, scale, baseY2, alphaMap)
  }

  ctx.textBaseline = 'alphabetic'
}

function drawPixelDensity(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, pad: number,
  sensors: Required<SensorPreset>[],
  resolution: number,
  alphaMap?: Map<string, number>,
) {
  // We want to combine 'mf_645' and 'mf' into a single visual column
  // To do this, we map sensors to visual columns
  type ColumnGroup = { title: string, color: string, items: { sensor: Required<SensorPreset>, entries: MpEntry[] }[] }
  const columns: ColumnGroup[] = []
  
  for (const s of sensors) {
    const entries = COMMON_MP[s.id] ?? [{ mp: resolution, models: '' }]
    
    // If it's a medium format sensor, we group it under "Medium Format"
    if (s.id.startsWith('mf')) {
      let mfCol = columns.find(c => c.title === 'Medium Format')
      if (!mfCol) {
        mfCol = { title: 'Medium Format', color: s.color, items: [] }
        columns.push(mfCol)
      }
      mfCol.items.push({ sensor: s, entries })
    } else {
      // Normal 1:1 mapping for other sensors
      const shortName = s.name.split(' (')[0]
      columns.push({ title: shortName, color: s.color, items: [{ sensor: s, entries }] })
    }
  }

  const colGap = 24
  const rowGap = 12
  const labelH = 46

  // Find maximum sensor dimension for scaling across all displayed sensors
  const maxSensorW = Math.max(...sensors.map((s) => s.w))

  // Compute how much horizontal space we need
  const availW = W - pad * 2
  const availH = H - pad * 2
  const colW = Math.min(
    (availW - (columns.length - 1) * colGap) / columns.length,
    200,
  )

  // Scale: map sensor mm to pixels so the largest sensor fills colW
  const sensorScale = (colW - 8) / maxSensorW

  const totalW = columns.length * colW + (columns.length - 1) * colGap
  let colX = (W - totalW) / 2

  for (const col of columns) {
    // Column alpha: max of all sensors in the group
    const colAlpha = alphaMap
      ? Math.max(...col.items.map(item => alphaMap.get(item.sensor.id) ?? 1))
      : 1

    // Center the column header
    ctx.save()
    ctx.globalAlpha = colAlpha
    ctx.fillStyle = col.color
    ctx.font = 'bold 11px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(col.title, colX + colW / 2, pad)
    ctx.restore()

    // Draw each MP variant vertically
    let gridY = pad + 20

    for (const item of col.items) {
      const s = item.sensor
      const a = alphaMap?.get(s.id) ?? 1
      const sensorPxW = s.w * sensorScale
      const sensorPxH = s.h * sensorScale

      for (const entry of item.entries) {
        const { mp, models } = entry
        const pitch = pixelPitch(s.w, mp, s.h)

        // Draw sensor-sized rectangle with pixel grid inside
        const rx = colX + (colW - sensorPxW) / 2
        const ry = gridY

        if (ry + sensorPxH + labelH > availH + pad) break // out of vertical space

        ctx.save()
        ctx.globalAlpha = a

        // Pixel grid: cell size proportional to pixel pitch
        const cellSize = Math.max(pitch * sensorScale * 0.25, 1.5)
        const cols = Math.max(1, Math.floor(sensorPxW / cellSize))
        const rows = Math.max(1, Math.floor(sensorPxH / cellSize))
        const actualGridW = cols * cellSize
        const actualGridH = rows * cellSize
        const gridOffX = rx + (sensorPxW - actualGridW) / 2
        const gridOffY = ry + (sensorPxH - actualGridH) / 2

        // Background fill for sensor area
        roundRect(ctx, rx, ry, sensorPxW, sensorPxH, 3)
        ctx.fillStyle = rgba(s.color, 0.06)
        ctx.fill()

        // Draw pixel grid (limit total cells to avoid performance issues)
        const maxCells = 2000
        if (cols * rows <= maxCells) {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cx = gridOffX + c * cellSize
              const cy = gridOffY + r * cellSize
              ctx.fillStyle = rgba(s.color, 0.12)
              ctx.fillRect(cx, cy, cellSize, cellSize)
              ctx.strokeStyle = rgba(s.color, 0.25)
              ctx.lineWidth = 0.3
              ctx.strokeRect(cx, cy, cellSize, cellSize)
            }
          }
        } else {
          // Too many cells — just fill with a solid grid pattern hint
          ctx.fillStyle = rgba(s.color, 0.12)
          ctx.fillRect(gridOffX, gridOffY, actualGridW, actualGridH)

          // Draw a few representative grid lines
          ctx.strokeStyle = rgba(s.color, 0.2)
          ctx.lineWidth = 0.5
          const step = Math.max(actualGridW / 20, 3)
          for (let lx = gridOffX; lx <= gridOffX + actualGridW; lx += step) {
            ctx.beginPath()
            ctx.moveTo(lx, gridOffY)
            ctx.lineTo(lx, gridOffY + actualGridH)
            ctx.stroke()
          }
          for (let ly = gridOffY; ly <= gridOffY + actualGridH; ly += step) {
            ctx.beginPath()
            ctx.moveTo(gridOffX, ly)
            ctx.lineTo(gridOffX + actualGridW, ly)
            ctx.stroke()
          }
        }

        // Sensor border
        roundRect(ctx, rx, ry, sensorPxW, sensorPxH, 3)
        ctx.strokeStyle = rgba(s.color, 0.6)
        ctx.lineWidth = 1.5
        ctx.stroke()

        // MP label below
        ctx.fillStyle = s.color
        ctx.font = '10px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(`${mp} MP · ${pitch.toFixed(2)} µm`, colX + colW / 2, ry + sensorPxH + 4)

        // Model names
        let modelLines = 0
        if (models) {
          const parts = models.split(' / ')
          ctx.fillStyle = rgba(s.color, 0.5)
          ctx.font = '9px system-ui, sans-serif'
          for (let mi = 0; mi < parts.length; mi++) {
            ctx.fillText(parts[mi].trim(), colX + colW / 2, ry + sensorPxH + 18 + mi * 12)
          }
          modelLines = parts.length
        }

        ctx.restore()

        const entryLabelH = 20 + Math.max(1, modelLines) * 12
        gridY += sensorPxH + entryLabelH + rowGap
      }
    }

    colX += colW + colGap
  }

  ctx.textBaseline = 'alphabetic'
}

