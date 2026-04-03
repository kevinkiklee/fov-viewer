'use client'

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { getToolBySlug } from '@/lib/data/tools'
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
const DEFAULT_VISIBLE_IDS = ['ff', 'apsc_n', 'm43', 'phone']
const DEFAULT_VISIBLE = DEFAULT_VISIBLE_IDS.join(',')

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
        {SENSOR_DIMS.map((s) => (
          <label key={s.id} className={ss.checkLabel}>
            <input
              type="checkbox"
              checked={visible.has(s.id)}
              onChange={() => onToggleSensor(s.id)}
            />
            <span className={ss.checkDot} style={{ backgroundColor: s.color }} />
            <span className={ss.checkName}>{s.name}</span>
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

export function SensorSize() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState<Set<string>>(() => new Set(DEFAULT_VISIBLE_IDS))
  const [mode, setMode] = useState<DisplayMode>('overlay')
  const [resolution, setResolution] = useState(24)

  // Hydrate from URL params on client only to avoid SSR mismatch
  useEffect(() => {
    const params = parseQueryState(PARAM_SCHEMA)
    if (params.show) setVisible(new Set(params.show.split(',')))
    if (params.mode) setMode(params.mode)
    if (params.mp) setResolution(params.mp)
  }, [])

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
    const cssHeight = canvas.clientHeight || 420
    canvas.width = cssWidth * dpr
    canvas.height = cssHeight * dpr
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
          <div className={ss.header}>
            <h1 className={ss.title}>{tool?.name}</h1>
            <p className={ss.description}>{tool?.description}</p>
          </div>
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

  const sorted = [...sensors].sort((a, b) => b.w * b.h - a.w * a.h)

  // Draw all rects first (fills + strokes)
  for (const s of sorted) {
    const rw = s.w * scale
    const rh = s.h * scale
    const x = cx - rw / 2
    const y = cy - rh / 2
    const r = Math.min(4, rw * 0.02)

    roundRect(ctx, x, y, rw, rh, r)
    ctx.fillStyle = rgba(s.color, 0.08)
    ctx.fill()

    roundRect(ctx, x, y, rw, rh, r)
    ctx.strokeStyle = rgba(s.color, 0.7)
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // Draw labels separately — place each at the bottom-left of its rect,
  // staggered upward to avoid overlaps
  const pillH = 18
  const labelGap = 2
  let nextLabelBottom = cy + (sorted[0]?.h ?? 0) * scale / 2 - 6 // start near bottom of largest rect

  for (let i = sorted.length - 1; i >= 0; i--) {
    const s = sorted[i]
    const rw = s.w * scale
    const rh = s.h * scale
    const x = cx - rw / 2
    const y = cy - rh / 2

    const label = s.name
    ctx.font = '11px system-ui, sans-serif'
    const textW = ctx.measureText(label).width
    const pillW = textW + 10

    // Place label at the bottom-left of this rect, but don't overlap previous labels
    const idealY = y + rh - pillH - 6
    const pillY = Math.min(idealY, nextLabelBottom - pillH - labelGap)
    const pillX = x + 6

    roundRect(ctx, pillX, pillY, pillW, pillH, 3)
    ctx.fillStyle = rgba(s.color, 0.25)
    ctx.fill()
    roundRect(ctx, pillX, pillY, pillW, pillH, 3)
    ctx.strokeStyle = rgba(s.color, 0.5)
    ctx.lineWidth = 0.5
    ctx.stroke()

    ctx.fillStyle = s.color
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, pillX + 5, pillY + pillH / 2)

    nextLabelBottom = pillY
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
      ctx.fillText(`${s.w}×${s.h}`, rx + rw / 2, ry + rh - 4)
    }

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

// Common megapixel counts for real cameras per sensor type
const COMMON_MP: Record<string, number[]> = {
  mf: [50, 100, 150],
  ff: [24, 45, 61],
  apsc_n: [24, 26, 33],
  apsc_c: [24, 32],
  m43: [20, 25],
  '1in': [20],
  phone: [12, 48, 108],
}

function drawPixelDensity(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, pad: number,
  sensors: SensorDim[],
  resolution: number,
) {
  // Each sensor gets a column. Within each column, show grids for common MP values.
  // Grid physical size is proportional to actual sensor dimensions.

  const colGap = 24
  const rowGap = 12
  const labelH = 32

  // Find maximum sensor dimension for scaling
  const maxSensorW = Math.max(...sensors.map((s) => s.w))

  // Compute how much horizontal space we need
  const maxResolutions = Math.max(...sensors.map((s) => (COMMON_MP[s.id] ?? [resolution]).length))
  const availW = W - pad * 2
  const availH = H - pad * 2
  const colW = Math.min(
    (availW - (sensors.length - 1) * colGap) / sensors.length,
    200,
  )

  // Scale: map sensor mm to pixels so the largest sensor fills colW
  const sensorScale = (colW - 8) / maxSensorW

  const totalW = sensors.length * colW + (sensors.length - 1) * colGap
  let colX = (W - totalW) / 2

  for (const s of sensors) {
    const mpList = COMMON_MP[s.id] ?? [resolution]
    const sensorPxW = s.w * sensorScale
    const sensorPxH = s.h * sensorScale

    // Center the column header
    ctx.fillStyle = s.color
    ctx.font = 'bold 11px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const shortName = s.name.split(' (')[0]
    ctx.fillText(shortName, colX + colW / 2, pad)

    // Draw each MP variant vertically
    let gridY = pad + 20

    for (const mp of mpList) {
      const pitch = pixelPitch(s.w, mp)

      // Draw sensor-sized rectangle with pixel grid inside
      const rx = colX + (colW - sensorPxW) / 2
      const ry = gridY

      if (ry + sensorPxH + labelH > availH + pad) break // out of vertical space

      // Pixel grid: cell size proportional to pixel pitch
      // Use a consistent visual scale: 1µm = some pixels
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
      ctx.fillText(`${mp} MP`, colX + colW / 2, ry + sensorPxH + 4)

      // Pixel pitch
      ctx.fillStyle = rgba(s.color, 0.5)
      ctx.font = '9px monospace'
      ctx.fillText(`${pitch.toFixed(2)} µm`, colX + colW / 2, ry + sensorPxH + 17)

      gridY += sensorPxH + labelH + rowGap
    }

    colX += colW + colGap
  }

  ctx.textBaseline = 'alphabetic'
}
