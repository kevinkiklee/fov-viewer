'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import styles from '../shared/Calculator.module.css'
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

/** Full-frame diagonal (mm), used to compute crop factors for the comparison table. */
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
    const cssHeight = 350
    canvas.width = cssWidth * dpr
    canvas.height = cssHeight * dpr
    canvas.style.height = `${cssHeight}px`
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, cssWidth, cssHeight)

    if (visibleSensors.length === 0) return

    const padding = 20

    if (mode === 'overlay') {
      // Overlay mode: all sensors drawn centered on the same point.
      // Scale is determined by the largest sensor so all fit within the canvas.
      // Drawing order is largest-first so smaller sensors appear on top.
      const maxW = Math.max(...visibleSensors.map((s) => s.w))
      const maxH = Math.max(...visibleSensors.map((s) => s.h))
      const scale = Math.min((cssWidth - padding * 2) / maxW, (cssHeight - padding * 2) / maxH)
      const cx = cssWidth / 2
      const cy = cssHeight / 2

      const sorted = [...visibleSensors].sort((a, b) => b.w * b.h - a.w * a.h)
      for (const s of sorted) {
        const rw = s.w * scale
        const rh = s.h * scale
        ctx.strokeStyle = s.color
        ctx.lineWidth = 2
        ctx.strokeRect(cx - rw / 2, cy - rh / 2, rw, rh)

        // Label
        ctx.fillStyle = s.color
        ctx.font = '11px system-ui, sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(s.name, cx - rw / 2 + 4, cy - rh / 2 + 14)
      }
    } else if (mode === 'side-by-side') {
      // Side-by-side mode: sensors arranged horizontally, aligned at the bottom
      // edge, with uniform scale so relative sizes are visually accurate.
      const totalW = visibleSensors.reduce((sum, s) => sum + s.w, 0)
      const gap = 8
      const totalGap = (visibleSensors.length - 1) * gap
      const maxH = Math.max(...visibleSensors.map((s) => s.h))
      const scaleX = (cssWidth - padding * 2 - totalGap) / totalW
      const scaleY = (cssHeight - padding * 2 - 20) / maxH // 20 for label space
      const scale = Math.min(scaleX, scaleY)

      const totalScaledW = visibleSensors.reduce((sum, s) => sum + s.w * scale, 0) + totalGap
      let x = (cssWidth - totalScaledW) / 2
      const baseY = cssHeight - padding

      for (const s of visibleSensors) {
        const rw = s.w * scale
        const rh = s.h * scale

        ctx.strokeStyle = s.color
        ctx.lineWidth = 2
        ctx.strokeRect(x, baseY - rh, rw, rh)

        // Label below
        ctx.fillStyle = s.color
        ctx.font = '10px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(s.name, x + rw / 2, baseY - rh - 4)

        x += rw + gap
      }
    } else {
      // Pixel density mode: draw grids where cell size is proportional to pixel pitch
      const pitches = visibleSensors.map((s) => ({
        ...s,
        pitch: pixelPitch(s.w, resolution),
      }))
      const maxPitch = Math.max(...pitches.map((p) => p.pitch))
      const baseCellSize = 6 // px for the largest pitch
      const labelHeight = 32
      const gridSize = 60 // px for the grid box (square)
      const gap = 16
      const totalGridW = pitches.length * gridSize + (pitches.length - 1) * gap
      let x = (cssWidth - totalGridW) / 2
      const gridTop = (cssHeight - gridSize - labelHeight) / 2

      for (const p of pitches) {
        const cellSize = (p.pitch / maxPitch) * baseCellSize
        const cols = Math.floor(gridSize / cellSize)
        const rows = Math.floor(gridSize / cellSize)

        // Draw grid cells
        ctx.fillStyle = p.color + '33' // 20% opacity
        ctx.strokeStyle = p.color
        ctx.lineWidth = 0.5

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const cx = x + col * cellSize
            const cy = gridTop + row * cellSize
            ctx.fillRect(cx, cy, cellSize, cellSize)
            ctx.strokeRect(cx, cy, cellSize, cellSize)
          }
        }

        // Border around the grid area
        ctx.strokeStyle = p.color
        ctx.lineWidth = 1.5
        ctx.strokeRect(x, gridTop, cols * cellSize, rows * cellSize)

        // Label below
        ctx.fillStyle = p.color
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        const labelX = x + gridSize / 2
        ctx.fillText(p.name, labelX, gridTop + gridSize + 14)
        ctx.fillStyle = '#888888'
        ctx.font = '10px monospace'
        ctx.fillText(`${p.pitch.toFixed(2)} µm`, labelX, gridTop + gridSize + 26)

        x += gridSize + gap
      }
    }
  }, [visibleSensors, mode, resolution])

  // Redraw when data or mode changes
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Redraw when canvas container resizes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      drawCanvas()
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [drawCanvas])

  return (
    <div>
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
              <span>{s.name}</span>
            </label>
          ))}
        </div>

        <div className={ss.modeToggle}>
          <button
            className={`${ss.modeBtn} ${mode === 'overlay' ? ss.modeBtnActive : ''}`}
            onClick={() => setMode('overlay')}
            aria-pressed={mode === 'overlay'}
          >
            Overlay
          </button>
          <button
            className={`${ss.modeBtn} ${mode === 'side-by-side' ? ss.modeBtnActive : ''}`}
            onClick={() => setMode('side-by-side')}
            aria-pressed={mode === 'side-by-side'}
          >
            Side by Side
          </button>
          <button
            className={`${ss.modeBtn} ${mode === 'pixel-density' ? ss.modeBtnActive : ''}`}
            onClick={() => setMode('pixel-density')}
            aria-pressed={mode === 'pixel-density'}
          >
            Pixel Density
          </button>
        </div>

        {mode === 'pixel-density' && (
          <label className={ss.resolutionField}>
            Resolution
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

      <canvas
        ref={canvasRef}
        className={ss.canvas}
        style={{ width: '100%', height: 350 }}
        aria-label={`Sensor size comparison in ${mode} mode`}
        role="img"
      />

      <div className={styles.tableWrap} style={{ marginTop: 16 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Sensor</th>
              <th>Width (mm)</th>
              <th>Height (mm)</th>
              <th>Area (mm&sup2;)</th>
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
                    <span className={ss.tableDot} style={{ backgroundColor: s.color }} />
                    {s.name}
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
  )
}
