'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { LearnPanel } from '@/components/shared/LearnPanel'
import ss from './SensorSize.module.css'
import { pixelPitch } from '@/lib/math/diffraction'
import { parseQueryState, useToolQuerySync, strParam, intParam } from '@/lib/utils/querySync'

const SENSOR_DIMS = [
  { id: 'mf', name: 'Medium Format', w: 43.8, h: 32.9, color: '#8b5cf6' },
  { id: 'ff', name: 'Full Frame', w: 36, h: 24, color: '#3b82f6' },
  { id: 'apsc_n', name: 'APS-C (Nikon/Sony)', w: 23.5, h: 15.6, color: '#10b981' },
  { id: 'apsc_c', name: 'APS-C (Canon)', w: 22.3, h: 14.9, color: '#f59e0b' },
  { id: 'm43', name: 'Micro Four Thirds', w: 17.3, h: 13, color: '#ef4444' },
  { id: '1in', name: '1" Sensor', w: 13.2, h: 8.8, color: '#ec4899' },
  { id: 'phone', name: 'Smartphone (1/1.7")', w: 7.6, h: 5.7, color: '#6366f1' },
] as const

type DisplayMode = 'overlay' | 'side-by-side' | 'pixel-density'

const FF_DIAG = Math.sqrt(36 * 36 + 24 * 24)

const ALL_SENSOR_IDS = SENSOR_DIMS.map((s) => s.id) as unknown as string[]
const ALL_SENSOR_ID_SET = new Set(ALL_SENSOR_IDS)
const DEFAULT_VISIBLE = ALL_SENSOR_IDS.join(',')

const PARAM_SCHEMA = {
  show: {
    default: DEFAULT_VISIBLE,
    parse: (raw: string) => {
      const ids = raw.split(',').filter((id) => ALL_SENSOR_ID_SET.has(id))
      return ids.length > 0 ? ids.join(',') : undefined
    },
    serialize: (v: string) => v,
  },
  mode: strParam<DisplayMode>('overlay', ['overlay', 'side-by-side', 'pixel-density'] as const),
  mp: intParam(24, 1, 200),
}

/** Hex color to rgba with alpha */
function rgba(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${a})`
}

/** Draw a rounded rectangle */
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

export function SensorSize() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const params = parseQueryState(PARAM_SCHEMA)
  const [visible, setVisible] = useState<Set<string>>(() => new Set(params.show ? params.show.split(',') : ALL_SENSOR_IDS))
  const [mode, setMode] = useState<DisplayMode>(params.mode ?? 'overlay')
  const [resolution, setResolution] = useState(params.mp ?? 24)

  useToolQuerySync(
    { show: Array.from(visible).join(','), mode, mp: resolution },
    PARAM_SCHEMA,
  )

  const toggleSensor = useCallback((id: string) => {
    setVisible((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const visibleSensors = SENSOR_DIMS.filter((s) => visible.has(s.id))

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const cssWidth = canvas.clientWidth
    const cssHeight = 420
    canvas.width = cssWidth * dpr
    canvas.height = cssHeight * dpr
    canvas.style.height = `${cssHeight}px`
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, cssWidth, cssHeight)

    if (visibleSensors.length === 0) return

    const padding = 30

    if (mode === 'overlay') {
      drawOverlay(ctx, cssWidth, cssHeight, padding, visibleSensors)
    } else if (mode === 'side-by-side') {
      drawSideBySide(ctx, cssWidth, cssHeight, padding, visibleSensors)
    } else {
      drawPixelDensity(ctx, cssWidth, cssHeight, padding, visibleSensors, resolution)
    }
  }, [visibleSensors, mode, resolution])

  useEffect(() => { drawCanvas() }, [drawCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => drawCanvas())
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [drawCanvas])

  return (
    <div className={ss.wrapper}>
      <div className={ss.toolbar}>
        <div className={ss.checkboxes}>
          {SENSOR_DIMS.map((s) => (
            <label key={s.id} className={ss.checkLabel}>
              <input
                type="checkbox"
                checked={visible.has(s.id)}
                onChange={() => toggleSensor(s.id)}
              />
              <span className={ss.checkDot} style={{ backgroundColor: s.color }} />
              <span className={ss.checkName}>{s.name}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className={ss.modeToggle}>
            {(['overlay', 'side-by-side', 'pixel-density'] as const).map((m) => (
              <button
                key={m}
                className={`${ss.modeBtn} ${mode === m ? ss.modeBtnActive : ''}`}
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
              >
                {m === 'overlay' ? 'Overlay' : m === 'side-by-side' ? 'Side by Side' : 'Pixel Density'}
              </button>
            ))}
          </div>

          {mode === 'pixel-density' && (
            <label className={ss.resolutionField}>
              <input
                type="number"
                min={1}
                max={200}
                value={resolution}
                onChange={(e) => setResolution(Math.max(1, Number(e.target.value)))}
              />
              MP
            </label>
          )}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className={ss.canvas}
        style={{ width: '100%', height: 420 }}
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
      <LearnPanel slug="sensor-size" />
    </div>
  )
}

// ── Drawing functions ──

type SensorDim = typeof SENSOR_DIMS[number]

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, pad: number,
  sensors: SensorDim[],
) {
  const maxW = Math.max(...sensors.map((s) => s.w))
  const maxH = Math.max(...sensors.map((s) => s.h))
  const scale = Math.min((W - pad * 2) / maxW, (H - pad * 2) / maxH)
  const cx = W / 2
  const cy = H / 2

  // Draw largest first so smaller sensors appear on top
  const sorted = [...sensors].sort((a, b) => b.w * b.h - a.w * a.h)

  for (const s of sorted) {
    const rw = s.w * scale
    const rh = s.h * scale
    const x = cx - rw / 2
    const y = cy - rh / 2
    const r = Math.min(4, rw * 0.02)

    // Fill
    roundRect(ctx, x, y, rw, rh, r)
    ctx.fillStyle = rgba(s.color, 0.08)
    ctx.fill()

    // Border
    roundRect(ctx, x, y, rw, rh, r)
    ctx.strokeStyle = rgba(s.color, 0.7)
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Label — positioned at top-left corner, with a background pill
    const label = s.name
    ctx.font = '11px system-ui, sans-serif'
    const textW = ctx.measureText(label).width
    const pillX = x + 6
    const pillY = y + 6
    const pillW = textW + 10
    const pillH = 18

    roundRect(ctx, pillX, pillY, pillW, pillH, 3)
    ctx.fillStyle = rgba(s.color, 0.2)
    ctx.fill()

    ctx.fillStyle = s.color
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, pillX + 5, pillY + pillH / 2)
  }

  // Dimension annotation for the largest visible sensor
  const largest = sorted[0]
  const lw = largest.w * scale
  const lh = largest.h * scale
  const lx = cx - lw / 2
  const ly = cy - lh / 2

  ctx.strokeStyle = rgba(largest.color, 0.3)
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])

  // Width dimension line (below)
  const dimY = ly + lh + 16
  ctx.beginPath()
  ctx.moveTo(lx, dimY)
  ctx.lineTo(lx + lw, dimY)
  ctx.stroke()
  // End ticks
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

  // Height dimension line (right)
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

function drawSideBySide(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, pad: number,
  sensors: SensorDim[],
) {
  const gap = 12
  const labelSpace = 36
  const totalW = sensors.reduce((sum, s) => sum + s.w, 0)
  const totalGap = (sensors.length - 1) * gap
  const maxH = Math.max(...sensors.map((s) => s.h))
  const scaleX = (W - pad * 2 - totalGap) / totalW
  const scaleY = (H - pad * 2 - labelSpace) / maxH
  const scale = Math.min(scaleX, scaleY)

  const totalScaledW = sensors.reduce((sum, s) => sum + s.w * scale, 0) + totalGap
  let x = (W - totalScaledW) / 2
  const baseY = H - pad - labelSpace

  for (const s of sensors) {
    const rw = s.w * scale
    const rh = s.h * scale
    const r = Math.min(4, rw * 0.03)
    const rx = x
    const ry = baseY - rh

    // Fill
    roundRect(ctx, rx, ry, rw, rh, r)
    ctx.fillStyle = rgba(s.color, 0.12)
    ctx.fill()

    // Border
    roundRect(ctx, rx, ry, rw, rh, r)
    ctx.strokeStyle = rgba(s.color, 0.7)
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Dimension inside
    ctx.fillStyle = rgba(s.color, 0.5)
    ctx.font = '9px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    if (rw > 40) {
      ctx.fillText(`${s.w}×${s.h}`, rx + rw / 2, ry + rh - 4)
    }

    // Name below
    ctx.fillStyle = s.color
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const nameLabel = s.name.length > 14 ? s.name.replace(' (', '\n(') : s.name
    const lines = nameLabel.split('\n')
    lines.forEach((line, i) => {
      ctx.fillText(line, rx + rw / 2, baseY + 6 + i * 13)
    })

    x += rw + gap
  }

  ctx.textBaseline = 'alphabetic'
}

function drawPixelDensity(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, pad: number,
  sensors: SensorDim[],
  resolution: number,
) {
  const pitches = sensors.map((s) => ({
    ...s,
    pitch: pixelPitch(s.w, resolution),
  }))
  const maxPitch = Math.max(...pitches.map((p) => p.pitch))
  const baseCellSize = 7
  const labelHeight = 40
  const gridSize = 64
  const gap = 20
  const totalGridW = pitches.length * gridSize + (pitches.length - 1) * gap
  let x = (W - totalGridW) / 2
  const gridTop = (H - gridSize - labelHeight) / 2

  for (const p of pitches) {
    const cellSize = (p.pitch / maxPitch) * baseCellSize
    const cols = Math.floor(gridSize / cellSize)
    const rows = Math.floor(gridSize / cellSize)
    const actualW = cols * cellSize
    const actualH = rows * cellSize
    const offsetX = x + (gridSize - actualW) / 2
    const offsetY = gridTop + (gridSize - actualH) / 2

    // Grid cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = offsetX + col * cellSize
        const cy = offsetY + row * cellSize
        ctx.fillStyle = rgba(p.color, 0.15)
        ctx.fillRect(cx, cy, cellSize, cellSize)
        ctx.strokeStyle = rgba(p.color, 0.3)
        ctx.lineWidth = 0.3
        ctx.strokeRect(cx, cy, cellSize, cellSize)
      }
    }

    // Border
    roundRect(ctx, offsetX, offsetY, actualW, actualH, 2)
    ctx.strokeStyle = rgba(p.color, 0.6)
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Label
    ctx.fillStyle = p.color
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(p.name.split(' (')[0], x + gridSize / 2, gridTop + gridSize + 8)

    ctx.fillStyle = rgba(p.color, 0.6)
    ctx.font = '10px monospace'
    ctx.fillText(`${p.pitch.toFixed(2)} µm`, x + gridSize / 2, gridTop + gridSize + 22)

    x += gridSize + gap
  }

  ctx.textBaseline = 'alphabetic'
}
