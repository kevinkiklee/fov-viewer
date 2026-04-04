'use client'

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { ToolActions } from '@/components/shared/ToolActions'
import { getToolBySlug } from '@/lib/data/tools'
import ss from './SensorSize.module.css'
import { pixelPitch } from '@/lib/math/diffraction'
// strParam and intParam kept for reference but query sync is manual
import { SENSORS, POPULAR_MODELS, COMMON_MP, type MpEntry } from '@/lib/data/sensors'
import type { SensorPreset } from '@/lib/types'

type DisplayMode = 'overlay' | 'side-by-side' | 'pixel-density'

const FF_DIAG = Math.sqrt(36 * 36 + 24 * 24)

const ALL_SENSOR_IDS = SENSORS.map((s) => s.id) as unknown as string[]
const ALL_SENSOR_ID_SET = new Set(ALL_SENSOR_IDS)
const DEFAULT_VISIBLE_IDS = ['mf', 'ff', 'apsc_n', 'm43', 'phone']
const DEFAULT_VISIBLE = DEFAULT_VISIBLE_IDS.join('+')

// Query params are parsed and synced manually in the component

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

const tool = getToolBySlug('sensor-size-comparison')

function CustomSensorForm({ onAdd }: { onAdd: (name: string, w: number, h: number, mp: number) => void }) {
  const [name, setName] = useState('')
  const [w, setW] = useState('')
  const [h, setH] = useState('')
  const [mp, setMp] = useState('')
  const [warning, setWarning] = useState<string | null>(null)
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clampDim = (val: string, setter: (v: string) => void) => {
    const num = parseFloat(val)
    if (!isNaN(num) && num > 99) {
      setter('99')
      setWarning('Max sensor dimension is 99 mm')
      if (warningTimer.current) clearTimeout(warningTimer.current)
      warningTimer.current = setTimeout(() => setWarning(null), 2000)
    } else {
      setter(val.slice(0, 5))
    }
  }

  const handleSubmit = () => {
    const wn = parseFloat(w)
    const hn = parseFloat(h)
    const mpn = parseFloat(mp) || 0
    if (!name.trim() || isNaN(wn) || isNaN(hn) || wn <= 0 || hn <= 0) return
    onAdd(name.trim(), wn, hn, mpn)
    setName(''); setW(''); setH(''); setMp('')
  }

  return (
    <div className={ss.customForm}>
      <input className={ss.customInput} placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <div className={ss.customRow}>
        <input className={ss.customInput} placeholder="W (mm)" type="number" step="0.1" min="0.1" value={w} onChange={e => clampDim(e.target.value, setW)} />
        <span className={ss.customX}>×</span>
        <input className={ss.customInput} placeholder="H (mm)" type="number" step="0.1" min="0.1" value={h} onChange={e => clampDim(e.target.value, setH)} />
      </div>
      {warning && <div className={ss.customWarning}>{warning}</div>}
      <input className={ss.customInput} placeholder="Megapixels (optional)" type="number" step="1" min="1" value={mp} onChange={e => setMp(e.target.value)} />
      <button className={ss.customAddBtn} onClick={handleSubmit} disabled={!name.trim() || !w || !h}>
        Add Sensor
      </button>
    </div>
  )
}

function EditSensorRow({ sensor, onSave, onCancel }: {
  sensor: Required<SensorPreset>
  onSave: (id: string, name: string, w: number, h: number, mp: number) => void
  onCancel: () => void
}) {
  const mp = COMMON_MP[sensor.id]?.[0]?.mp ?? 0
  const [name, setName] = useState(sensor.name)
  const [w, setW] = useState(String(sensor.w))
  const [h, setH] = useState(String(sensor.h))
  const [mpVal, setMpVal] = useState(mp > 0 ? String(mp) : '')

  const handleSave = () => {
    const wn = Math.min(parseFloat(w), 99)
    const hn = Math.min(parseFloat(h), 99)
    if (!name.trim() || isNaN(wn) || isNaN(hn) || wn <= 0 || hn <= 0) return
    onSave(sensor.id, name.trim(), wn, hn, parseFloat(mpVal) || 0)
  }

  return (
    <div className={ss.editForm}>
      <input className={ss.customInput} value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      <div className={ss.customRow}>
        <input className={ss.customInput} value={w} onChange={e => setW(e.target.value.slice(0, 5))} type="number" step="0.1" min="0.1" placeholder="W" />
        <span className={ss.customX}>×</span>
        <input className={ss.customInput} value={h} onChange={e => setH(e.target.value.slice(0, 5))} type="number" step="0.1" min="0.1" placeholder="H" />
      </div>
      <input className={ss.customInput} value={mpVal} onChange={e => setMpVal(e.target.value)} type="number" step="1" min="1" placeholder="MP" />
      <div className={ss.editActions}>
        <button className={ss.customAddBtn} onClick={handleSave}>Save</button>
        <button className={ss.editCancelBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function ControlsPanel({
  visible, mode, resolution, customSensors,
  onToggleSensor, onModeChange, onResolutionChange, onAddCustom, onRemoveCustom, onRemoveAllCustom, onEditCustom,
}: {
  visible: Set<string>
  mode: DisplayMode
  resolution: number
  customSensors: Required<SensorPreset>[]
  onToggleSensor: (id: string) => void
  onModeChange: (m: DisplayMode) => void
  onResolutionChange: (v: number) => void
  onAddCustom: (name: string, w: number, h: number, mp: number) => void
  onRemoveCustom: (id: string) => void
  onRemoveAllCustom: () => void
  onEditCustom: (id: string, name: string, w: number, h: number, mp: number) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  return (
    <>
      <ModeToggle
        title="Display Mode"
        options={[
          { value: 'overlay', label: 'Overlay' },
          { value: 'side-by-side', label: 'Side by Side' },
          { value: 'pixel-density', label: 'Pixel Density' },
        ]}
        value={mode}
        onChange={onModeChange}
      />

      {mode === 'pixel-density' && (
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Showing common megapixel counts for each sensor. Larger pixels (bigger cells) capture more light.
        </p>
      )}

      <div className={ss.sectionLabel}>Sensors</div>
      <div className={ss.checkboxes}>
        {(SENSORS as Required<SensorPreset>[]).map((s) => (
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

      <div className={ss.sectionLabel}>Custom Sensors</div>
      {customSensors.length > 0 && (
        <div className={ss.checkboxes}>
          {[...customSensors].sort((a, b) => (b.w * b.h) - (a.w * a.h)).map((s) => {
            if (editingId === s.id) {
              return (
                <EditSensorRow
                  key={s.id}
                  sensor={s}
                  onSave={(id, name, w, h, mp) => { onEditCustom(id, name, w, h, mp); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                />
              )
            }
            return (
              <label key={s.id} className={ss.checkLabel}>
                <input
                  type="checkbox"
                  checked={visible.has(s.id)}
                  onChange={() => onToggleSensor(s.id)}
                />
                <span className={ss.checkDot} style={{ backgroundColor: s.color }} />
                <span className={ss.checkName}>{s.name}</span>
                <button
                  className={ss.customEditBtn}
                  onClick={(e) => { e.preventDefault(); setEditingId(s.id) }}
                  title="Edit"
                >
                  ✎
                </button>
                <button
                  className={ss.customRemoveBtn}
                  onClick={(e) => { e.preventDefault(); onRemoveCustom(s.id) }}
                  title="Remove"
                >
                  ✕
                </button>
                <span className={ss.checkOutline} />
              </label>
            )
          })}
        </div>
      )}
      <CustomSensorForm onAdd={onAddCustom} />
      {customSensors.length > 0 && (
        <button className={ss.deleteAllBtn} onClick={onRemoveAllCustom}>
          Delete All Custom Sensors
        </button>
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

// Stored rect positions for hit-testing overlay mode
type SensorRect = { id: string; x: number; y: number; w: number; h: number; sensorW: number; sensorH: number; color: string }
let overlayRects: SensorRect[] = []

const CUSTOM_COLORS = ['#06b6d4', '#f97316', '#84cc16', '#e879f9', '#facc15', '#fb7185']
let customColorIdx = 0

const STORAGE_KEY = 'phototools:custom-sensors'

type StoredCustomSensor = { id: string; name: string; w: number; h: number; cropFactor: number; color: string; mp?: number }

function loadCustomSensors(): Required<SensorPreset>[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const stored: StoredCustomSensor[] = JSON.parse(raw)
    // Restore COMMON_MP entries
    for (const s of stored) {
      if (s.mp && s.mp > 0) {
        COMMON_MP[s.id] = [{ mp: s.mp, models: s.name }]
      }
    }
    customColorIdx = stored.length
    return stored.map(s => ({ id: s.id, name: s.name, w: s.w, h: s.h, cropFactor: s.cropFactor, color: s.color }))
  } catch { return [] }
}

function saveCustomSensors(sensors: Required<SensorPreset>[]) {
  try {
    const stored: StoredCustomSensor[] = sensors.map(s => ({
      id: s.id, name: s.name, w: s.w, h: s.h, cropFactor: s.cropFactor, color: s.color,
      mp: COMMON_MP[s.id]?.[0]?.mp,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch { /* ignore */ }
}

/** Encode custom sensors as a query param: name~w~h~mp, ... */
function encodeCustomParam(sensors: Required<SensorPreset>[]): string {
  return sensors.map(s => {
    const mp = COMMON_MP[s.id]?.[0]?.mp ?? 0
    return `${s.name}~${s.w}~${s.h}~${mp}`
  }).join(',')
}

function decodeCustomParam(raw: string): Required<SensorPreset>[] {
  if (!raw) return []
  return raw.split(',').map((entry, i) => {
    const [name, ws, hs, mps] = entry.split('~')
    const w = parseFloat(ws)
    const h = parseFloat(hs)
    const mp = parseFloat(mps) || 0
    if (!name || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null
    const id = `custom_url_${i}`
    const color = CUSTOM_COLORS[i % CUSTOM_COLORS.length]
    const diag = Math.sqrt(w * w + h * h)
    const cropFactor = FF_DIAG / diag
    if (mp > 0) COMMON_MP[id] = [{ mp, models: name }]
    return { id, name, w, h, cropFactor, color } as Required<SensorPreset>
  }).filter(Boolean) as Required<SensorPreset>[]
}

export function SensorSize() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState<Set<string>>(() => new Set(DEFAULT_VISIBLE_IDS))
  const [mode, setMode] = useState<DisplayMode>('overlay')
  const [resolution, setResolution] = useState(24)
  const [hoveredSensor, setHoveredSensor] = useState<string | null>(null)
  const [customSensors, setCustomSensors] = useState<Required<SensorPreset>[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Animation state: maps sensor id → { progress: 0..1, direction: 'in' | 'out', startTime }
  const animRef = useRef<Map<string, { progress: number; direction: 'in' | 'out'; startTime: number }>>(new Map())
  const rafRef = useRef<number>(0)
  const prevVisibleRef = useRef<Set<string>>(new Set(DEFAULT_VISIBLE_IDS))

  // Load custom sensors from localStorage or URL on mount, then apply show param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const customParam = params.get('custom')
    let loadedCustom: Required<SensorPreset>[] = []

    // Always load localStorage sensors first
    const storedCustom = loadCustomSensors()

    if (customParam) {
      // Merge URL custom sensors with localStorage sensors (URL sensors use custom_url_* IDs)
      const fromUrl = decodeCustomParam(customParam)
      // Combine: localStorage sensors + URL sensors (avoid ID conflicts)
      const urlIds = new Set(fromUrl.map(s => s.id))
      loadedCustom = [...storedCustom.filter(s => !urlIds.has(s.id)), ...fromUrl]
      customColorIdx = loadedCustom.length
    } else {
      loadedCustom = storedCustom
    }

    if (loadedCustom.length > 0) {
      setCustomSensors(loadedCustom)
    }

    // Now apply show param — accept built-in IDs, loaded custom IDs, and any custom_ prefixed IDs
    const showParam = params.get('show')
    if (showParam && showParam.length > 0) {
      // Explicit show param — select only what's specified
      const customIds = new Set(loadedCustom.map(s => s.id))
      const ids = showParam.split(/[+,]/).filter(id =>
        ALL_SENSOR_ID_SET.has(id) || customIds.has(id) || id.startsWith('custom_')
      )
      if (ids.length > 0) {
        setVisible(new Set(ids))
      }
    } else if (customParam && loadedCustom.length > 0) {
      // Custom param but no show param — select all custom sensors only
      setVisible(new Set(loadedCustom.map(s => s.id)))
    } else if (loadedCustom.length > 0) {
      // No URL params, but localStorage has custom sensors — add them to defaults
      setVisible(prev => {
        const next = new Set(prev)
        loadedCustom.forEach(s => next.add(s.id))
        return next
      })
    }

    // Apply mode and mp params
    const modeParam = params.get('mode')
    if (modeParam && ['overlay', 'side-by-side', 'pixel-density'].includes(modeParam)) {
      setMode(modeParam as DisplayMode)
    }
    const mpParam = params.get('mp')
    if (mpParam) {
      const n = parseInt(mpParam)
      if (!isNaN(n) && n >= 1 && n <= 200) setResolution(n)
    }

    setHydrated(true)
  }, [])

  // Persist custom sensors to localStorage when they change
  useEffect(() => {
    if (hydrated) saveCustomSensors(customSensors)
  }, [customSensors, hydrated])

  // Sync all params to URL (only after hydration)
  useEffect(() => {
    if (!hydrated) return
    const url = new URL(window.location.href)

    // show param
    const showVal = Array.from(visible).filter(id =>
      ALL_SENSOR_ID_SET.has(id) || customSensors.some(s => s.id === id)
    ).join('+')
    if (showVal && showVal !== DEFAULT_VISIBLE) {
      url.searchParams.set('show', showVal)
    } else if (showVal === DEFAULT_VISIBLE) {
      url.searchParams.delete('show')
    } else {
      url.searchParams.set('show', showVal)
    }

    // mode param
    if (mode !== 'overlay') {
      url.searchParams.set('mode', mode)
    } else {
      url.searchParams.delete('mode')
    }

    // mp param
    if (resolution !== 24) {
      url.searchParams.set('mp', String(resolution))
    } else {
      url.searchParams.delete('mp')
    }

    // custom param
    const customParam = customSensors.length > 0 ? encodeCustomParam(customSensors) : ''
    if (customParam) {
      url.searchParams.set('custom', customParam)
    } else {
      url.searchParams.delete('custom')
    }

    window.history.replaceState(null, '', url.toString())
  }, [visible, mode, resolution, customSensors, hydrated])

  const allSensors = [...SENSORS as Required<SensorPreset>[], ...customSensors]
  const visibleSensors = allSensors.filter((s) => visible.has(s.id))

  const toggleSensor = useCallback((id: string) => {
    setVisible((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const addCustomSensor = useCallback((name: string, w: number, h: number, mp: number) => {
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const color = CUSTOM_COLORS[customColorIdx % CUSTOM_COLORS.length]
    customColorIdx++
    const diag = Math.sqrt(w * w + h * h)
    const cropFactor = FF_DIAG / diag
    const sensor: Required<SensorPreset> = { id, name, w, h, cropFactor, color }
    setCustomSensors(prev => [...prev, sensor])
    setVisible(prev => new Set([...prev, id]))
    if (mp > 0) {
      COMMON_MP[id] = [{ mp, models: name }]
    }
  }, [])

  const editCustomSensor = useCallback((id: string, name: string, w: number, h: number, mp: number) => {
    const diag = Math.sqrt(w * w + h * h)
    const cropFactor = FF_DIAG / diag
    setCustomSensors(prev => prev.map(s => s.id === id ? { ...s, name, w, h, cropFactor } : s))
    if (mp > 0) {
      COMMON_MP[id] = [{ mp, models: name }]
    } else {
      delete COMMON_MP[id]
    }
  }, [])

  const removeAllCustomSensors = useCallback(() => {
    for (const s of customSensors) delete COMMON_MP[s.id]
    setCustomSensors([])
    setVisible(prev => {
      const next = new Set(prev)
      for (const s of customSensors) next.delete(s.id)
      return next
    })
  }, [customSensors])

  const removeCustomSensor = useCallback((id: string) => {
    setCustomSensors(prev => prev.filter(s => s.id !== id))
    setVisible(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    delete COMMON_MP[id]
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

    const sensors = allSensors.filter((s) => ids.has(s.id))

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
    const isMobile = cssWidth < 600
    // On mobile, use a large initial canvas then crop after drawing
    const maxHeight = isMobile ? 5000 : (canvas.clientHeight || 420)
    let cssHeight = maxHeight
    canvas.style.height = `${cssHeight}px`
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

    let contentH = cssHeight
    if (mode === 'overlay') {
      contentH = drawOverlay(ctx, cssWidth, cssHeight, padding, sensors, alphaMap, hoveredSensor)
    } else if (mode === 'side-by-side') {
      contentH = drawSideBySide(ctx, cssWidth, cssHeight, padding, sensors, alphaMap)
    } else {
      contentH = drawPixelDensity(ctx, cssWidth, cssHeight, padding, sensors, resolution, alphaMap)
    }

    // Crop canvas to actual content on mobile
    if (isMobile && contentH < cssHeight) {
      const finalH = Math.max(contentH + padding, 200)
      canvas.style.height = `${finalH}px`
      // Copy drawn content, resize, and redraw
      const imageData = ctx.getImageData(0, 0, canvas.width, Math.ceil(finalH * dpr))
      canvas.height = Math.ceil(finalH * dpr)
      ctx.putImageData(imageData, 0, 0)
    }

    if (animating) {
      rafRef.current = requestAnimationFrame(drawFrame)
    }
  }, [mode, resolution, getRenderSensors, hoveredSensor])

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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'overlay') { setHoveredSensor(null); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    // Check rects from smallest to largest (reverse of sorted order) for better hit precision
    for (let i = overlayRects.length - 1; i >= 0; i--) {
      const r = overlayRects[i]
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        setHoveredSensor(r.id)
        return
      }
    }
    setHoveredSensor(null)
  }, [mode])

  const handleMouseLeave = useCallback(() => {
    setHoveredSensor(null)
  }, [])

  const controlsProps = {
    visible, mode, resolution, customSensors,
    onToggleSensor: toggleSensor,
    onModeChange: setMode,
    onResolutionChange: setResolution,
    onAddCustom: addCustomSensor,
    onRemoveCustom: removeCustomSensor,
    onRemoveAllCustom: removeAllCustomSensors,
    onEditCustom: editCustomSensor,
  }

  return (
    <div className={ss.app}>
      <div className={ss.appBody}>
        <div className={ss.sidebar}>
          <ToolActions toolName="Sensor Size Comparison" toolSlug="sensor-size-comparison" canvasRef={canvasRef} imageFilename="sensor-comparison.png" onReset={() => {
            setVisible(new Set(DEFAULT_VISIBLE_IDS))
            setMode('overlay')
            setResolution(24)
          }} />
          <ControlsPanel {...controlsProps} />
        </div>

        <div className={ss.main}>
          <canvas
            ref={canvasRef}
            className={ss.canvas}
            style={{ width: '100%', flex: 1, minHeight: 300 }}
            aria-label={`Sensor size comparison in ${mode} mode`}
            role="img"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />

          <div className={`${ss.tableWrap} ${ss.desktopOnly}`}>
            <SensorTable sensors={visibleSensors} />
          </div>
        </div>

        <div className={ss.desktopOnly}>
          <LearnPanel slug="sensor-size-comparison" />
        </div>
      </div>

      <div className={ss.mobileControls}>
        <ControlsPanel {...controlsProps} />
        <div className={ss.tableWrap}>
          <SensorTable sensors={visibleSensors} />
        </div>
      </div>

      <div className={ss.mobileOnly}>
        <LearnPanel slug="sensor-size-comparison" />
      </div>
    </div>
  )
}

// ── Drawing functions ──

function SensorTable({ sensors }: { sensors: Required<SensorPreset>[] }) {
  const sorted = [...sensors].sort((a, b) => (b.w * b.h) - (a.w * a.h))
  return (
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
        {sorted.map((s) => {
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
  )
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, pad: number,
  sensors: Required<SensorPreset>[],
  alphaMap?: Map<string, number>,
  hoveredId?: string | null,
): number {
  const maxW = Math.max(...sensors.map((s) => s.w))
  const maxH = Math.max(...sensors.map((s) => s.h))
  const isMobile = W < 600

  // On mobile: labels go below rects; on desktop: labels go left
  const labelColumnW = isMobile ? 0 : 160
  const pillH = 18
  const labelGap = 4
  const sorted = [...sensors].sort((a, b) => b.w * b.h - a.w * a.h)
  const labelRowH = isMobile ? sorted.length * (pillH + labelGap) + 8 : 0

  const availW = W - pad * 2 - labelColumnW
  // On mobile, don't use full H for scaling — use a reasonable max for the sensor area
  const mobileMaxSensorH = isMobile ? Math.min(W * 0.8, 300) : 0
  const availH = isMobile
    ? mobileMaxSensorH
    : H - pad * 2 - labelRowH
  const scale = Math.min(availW / maxW, availH / maxH)
  const rectsH = maxH * scale
  const cx = pad + labelColumnW + availW / 2
  // On mobile, position from top; on desktop, center vertically
  const cy = isMobile
    ? pad + rectsH / 2
    : pad + (H - pad * 2 - labelRowH) / 2

  // Draw all rects first (fills + strokes), store positions for hit-testing
  overlayRects = []
  for (const s of sorted) {
    const a = alphaMap?.get(s.id) ?? 1
    const rw = s.w * scale
    const rh = s.h * scale
    const x = cx - rw / 2
    const y = cy - rh / 2
    const r = Math.min(4, rw * 0.02)

    overlayRects.push({ id: s.id, x, y, w: rw, h: rh, sensorW: s.w, sensorH: s.h, color: s.color })

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

  // Draw dimension labels inside rects that are large enough
  const MIN_DIM_W = 70
  const MIN_DIM_H = 30
  ctx.font = '9px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'

  for (const s of sorted) {
    const a = alphaMap?.get(s.id) ?? 1
    const rw = s.w * scale
    const rh = s.h * scale

    if (rw >= MIN_DIM_W && rh >= MIN_DIM_H) {
      const x = cx - rw / 2
      const y = cy - rh / 2
      ctx.save()
      ctx.globalAlpha = a * 0.5
      ctx.fillStyle = s.color
      ctx.fillText(`${s.w}×${s.h} mm`, x + rw / 2, y + rh - 4)
      ctx.restore()
    }
  }

  // Draw tooltip for hovered sensor if its rect is too small for inline dims
  if (hoveredId) {
    const hRect = overlayRects.find(r => r.id === hoveredId)
    if (hRect && (hRect.w < MIN_DIM_W || hRect.h < MIN_DIM_H)) {
      const label = `${hRect.sensorW}×${hRect.sensorH} mm`
      ctx.font = '10px system-ui, sans-serif'
      const tw = ctx.measureText(label).width + 10
      const th = 20
      const tx = hRect.x + hRect.w / 2 - tw / 2
      const ty = hRect.y - th - 4

      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      roundRect(ctx, tx, ty, tw, th, 4)
      ctx.fill()
      ctx.fillStyle = hRect.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, tx + tw / 2, ty + th / 2)
      ctx.restore()
    }
  }

  ctx.font = '11px system-ui, sans-serif'
  const pillWidths = sorted.map(s => ctx.measureText(s.name).width + 10)

  if (isMobile) {
    // ── Mobile: labels centered below the sensor rects ──
    const largest = sorted[0]
    const lh = largest.h * scale
    let labelY = cy + lh / 2 + 16

    for (let i = 0; i < sorted.length; i++) {
      const s = sorted[i]
      const a = alphaMap?.get(s.id) ?? 1
      const pillW = pillWidths[i]
      const pillX = cx - pillW / 2

      ctx.save()
      ctx.globalAlpha = a

      // Pill background
      roundRect(ctx, pillX, labelY, pillW, pillH, 3)
      ctx.fillStyle = rgba(s.color, 0.15)
      ctx.fill()

      // Color dot
      ctx.beginPath()
      ctx.arc(pillX - 8, labelY + pillH / 2, 3, 0, Math.PI * 2)
      ctx.fillStyle = s.color
      ctx.fill()

      // Label text
      ctx.fillStyle = s.color
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(s.name, pillX + 5, labelY + pillH / 2)

      ctx.restore()

      labelY += pillH + labelGap
    }
  } else {
    // ── Desktop: labels as a column to the left of rects ──
    const totalLabelH = sorted.length * pillH + (sorted.length - 1) * labelGap
    let labelY = cy - totalLabelH / 2

    const largestRectLeft = cx - sorted[0].w * scale / 2
    const columnRight = largestRectLeft - 20

    for (let i = 0; i < sorted.length; i++) {
      const s = sorted[i]
      const a = alphaMap?.get(s.id) ?? 1
      const rw = s.w * scale
      const rectLeft = cx - rw / 2
      const label = s.name
      const pillW = pillWidths[i]
      const pillX = columnRight - pillW
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
  }

  ctx.textBaseline = 'alphabetic'
  if (isMobile) {
    const largest = sorted[0]
    const lh = largest.h * scale
    const bottomOfRects = cy + lh / 2
    return bottomOfRects + 8 + labelRowH
  }
  return H
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

  // On mobile (2-per-row), use equal column widths for alignment
  const isMobileRow = W < 600
  const equalColW = isMobileRow ? (W - pad * 2 - (sensors.length - 1) * gap) / Math.max(sensors.length, 1) : 0
  const colWidths = isMobileRow
    ? sensors.map(() => equalColW)
    : sensors.map((s, i) => Math.max(s.w * scale, minTextWidths[i]))
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
): number {
  const isMobile = W < 600
  const useRows = isMobile || sensors.length > 5
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
    // Multiple rows: on mobile use 2 per row, otherwise split in half
    const perRow = isMobile ? 2 : Math.ceil(sensors.length / 2)
    const rows: Required<SensorPreset>[][] = []
    for (let i = 0; i < sensors.length; i += perRow) {
      rows.push(sensors.slice(i, i + perRow))
    }

    const rowGap = 20
    const maxModels = Math.max(...sensors.map(s => (POPULAR_MODELS[s.id] ?? []).length), 0)
    const labelSpace = 36 + maxModels * 12
    const maxH = Math.max(...sensors.map(s => s.h))

    // Compute scale that fits all rows
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

    const availH = (H - pad * 2 - (rows.length - 1) * rowGap - labelSpace * rows.length) / rows.length
    const maxRowLen = Math.max(...rows.map(r => r.length))
    const totalGap = (maxRowLen - 1) * gap
    const availW = W - pad * 2 - totalGap

    // Scale must fit the widest row and the available height
    let lo = 0, hi = Math.max(availH / maxH, 1)
    for (let iter = 0; iter < 30; iter++) {
      const midScale = (lo + hi) / 2
      let fits = true
      let sIdx = 0
      for (const row of rows) {
        const rowNeeded = row.reduce((sum, s) => {
          const tw = minTextWidths[sensors.indexOf(s)]
          return sum + Math.max(s.w * midScale, tw)
        }, 0)
        if (rowNeeded > availW) { fits = false; break }
        sIdx += row.length
      }
      if (fits && maxH * midScale <= availH) lo = midScale
      else hi = midScale
    }
    const scale = lo

    // Compute per-row heights based on each row's tallest sensor
    const rowHeights = rows.map(row => {
      const rowMaxH = Math.max(...row.map(s => s.h)) * scale
      const rowMaxModels = Math.max(...row.map(s => (POPULAR_MODELS[s.id] ?? []).length), 0)
      const rowLabelSpace = 36 + rowMaxModels * 12
      return { sensorH: rowMaxH, labelSpace: rowLabelSpace, total: rowMaxH + rowLabelSpace }
    })
    const totalHeight = rowHeights.reduce((sum, r) => sum + r.total, 0) + (rows.length - 1) * rowGap
    const startY = isMobile ? pad : (H - totalHeight) / 2

    let curY = startY
    for (let ri = 0; ri < rows.length; ri++) {
      const baseY = curY + rowHeights[ri].sensorH
      drawSideBySideRow(ctx, W, pad, rows[ri], scale, baseY, alphaMap)
      curY += rowHeights[ri].total + rowGap
    }

    ctx.textBaseline = 'alphabetic'
    return startY + totalHeight + pad
  }

  ctx.textBaseline = 'alphabetic'
  return H
}

function drawPixelDensity(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, pad: number,
  sensors: Required<SensorPreset>[],
  resolution: number,
  alphaMap?: Map<string, number>,
): number {
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

  const isMobile = W < 600
  const colGap = isMobile ? 12 : 24
  const rowGap = 12
  const labelH = 46

  // Find maximum sensor dimension for scaling across all displayed sensors
  const maxSensorW = Math.max(...sensors.map((s) => s.w))

  if (isMobile) {
    // ── Mobile: flatten all entries into a 2-column grid, grouped by sensor type ──
    type FlatEntry = { sensor: Required<SensorPreset>, mp: number, models: string, title?: string }
    const flatEntries: FlatEntry[] = []

    for (const col of columns) {
      let first = true
      for (const item of col.items) {
        for (const entry of item.entries) {
          flatEntries.push({
            sensor: item.sensor,
            mp: entry.mp,
            models: entry.models,
            title: first ? col.title : undefined,
          })
          first = false
        }
      }
    }

    const numCols = 2
    const availW = W - pad * 2
    const colW = (availW - colGap) / numCols
    const sensorScale = (colW - 8) / maxSensorW
    const totalRowW = numCols * colW + colGap
    const startX = (W - totalRowW) / 2

    // Group flat entries by category for aligned row layout
    type CategoryGroup = { title: string, color: string, entries: FlatEntry[] }
    const catGroups: CategoryGroup[] = []
    for (const fe of flatEntries) {
      if (fe.title) {
        catGroups.push({ title: fe.title, color: fe.sensor.color, entries: [fe] })
      } else {
        catGroups[catGroups.length - 1].entries.push(fe)
      }
    }

    let curY = pad

    for (const group of catGroups) {
      // Draw category title spanning full width
      if (curY > pad + 5) curY += 12
      const titleAlpha = alphaMap
        ? Math.max(...group.entries.map(e => alphaMap.get(e.sensor.id) ?? 1))
        : 1
      ctx.save()
      ctx.globalAlpha = titleAlpha
      ctx.fillStyle = group.color
      ctx.font = 'bold 11px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(group.title, W / 2, curY)
      ctx.restore()
      curY += 20

      // Draw entries in pairs (2 per row), aligned horizontally
      for (let ei = 0; ei < group.entries.length; ei += numCols) {
        const rowEntries = group.entries.slice(ei, ei + numCols)
        let rowH = 0

        for (let ci = 0; ci < rowEntries.length; ci++) {
          const fe = rowEntries[ci]
          const s = fe.sensor
          const a = alphaMap?.get(s.id) ?? 1
          const colX = startX + ci * (colW + colGap)

          const sensorPxW = s.w * sensorScale
          const sensorPxH = s.h * sensorScale
          const pitch = pixelPitch(s.w, fe.mp, s.h)

          const rx = colX + (colW - sensorPxW) / 2
          const ry = curY

          ctx.save()
          ctx.globalAlpha = a

          const cellSize = Math.max(pitch * sensorScale * 0.25, 1.5)
          const gridCols = Math.max(1, Math.floor(sensorPxW / cellSize))
          const gridRows = Math.max(1, Math.floor(sensorPxH / cellSize))
          const actualGridW = gridCols * cellSize
          const actualGridH = gridRows * cellSize
          const gridOffX = rx + (sensorPxW - actualGridW) / 2
          const gridOffY = ry + (sensorPxH - actualGridH) / 2

          roundRect(ctx, rx, ry, sensorPxW, sensorPxH, 3)
          ctx.fillStyle = rgba(s.color, 0.06)
          ctx.fill()

          const maxCells = 2000
          if (gridCols * gridRows <= maxCells) {
            for (let r = 0; r < gridRows; r++) {
              for (let c = 0; c < gridCols; c++) {
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
            ctx.fillStyle = rgba(s.color, 0.12)
            ctx.fillRect(gridOffX, gridOffY, actualGridW, actualGridH)
            ctx.strokeStyle = rgba(s.color, 0.2)
            ctx.lineWidth = 0.5
            const step = Math.max(actualGridW / 20, 3)
            for (let lx = gridOffX; lx <= gridOffX + actualGridW; lx += step) {
              ctx.beginPath(); ctx.moveTo(lx, gridOffY); ctx.lineTo(lx, gridOffY + actualGridH); ctx.stroke()
            }
            for (let ly = gridOffY; ly <= gridOffY + actualGridH; ly += step) {
              ctx.beginPath(); ctx.moveTo(gridOffX, ly); ctx.lineTo(gridOffX + actualGridW, ly); ctx.stroke()
            }
          }

          roundRect(ctx, rx, ry, sensorPxW, sensorPxH, 3)
          ctx.strokeStyle = rgba(s.color, 0.6)
          ctx.lineWidth = 1.5
          ctx.stroke()

          ctx.fillStyle = s.color
          ctx.font = '10px system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(`${fe.mp} MP · ${pitch.toFixed(2)} µm`, colX + colW / 2, ry + sensorPxH + 4)

          let modelLines = 0
          if (fe.models) {
            const parts = fe.models.split(' / ')
            ctx.fillStyle = rgba(s.color, 0.5)
            ctx.font = '9px system-ui, sans-serif'
            for (let mi = 0; mi < parts.length; mi++) {
              ctx.fillText(parts[mi].trim(), colX + colW / 2, ry + sensorPxH + 18 + mi * 12)
            }
            modelLines = parts.length
          }

          ctx.restore()

          const entryH = sensorPxH + 20 + Math.max(1, modelLines) * 12
          if (entryH > rowH) rowH = entryH
        }

        curY += rowH + rowGap
      }
    }
    return curY
  } else {
    // ── Desktop: one column per sensor type ──
    const colsPerRow = columns.length
    const availW = W - pad * 2
    const colW = Math.min(
      (availW - (colsPerRow - 1) * colGap) / colsPerRow,
      200,
    )
    const sensorScale = (colW - 8) / maxSensorW
    const totalRowW = colsPerRow * colW + (colsPerRow - 1) * colGap
    let colX = (W - totalRowW) / 2

    for (const col of columns) {
      const colAlpha = alphaMap
        ? Math.max(...col.items.map(item => alphaMap.get(item.sensor.id) ?? 1))
        : 1

      ctx.save()
      ctx.globalAlpha = colAlpha
      ctx.fillStyle = col.color
      ctx.font = 'bold 11px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(col.title, colX + colW / 2, pad)
      ctx.restore()

      let gridY = pad + 20

      for (const item of col.items) {
        const s = item.sensor
        const a = alphaMap?.get(s.id) ?? 1
        const sensorPxW = s.w * sensorScale
        const sensorPxH = s.h * sensorScale

        for (const entry of item.entries) {
          const { mp, models } = entry
          const pitch = pixelPitch(s.w, mp, s.h)
          const rx = colX + (colW - sensorPxW) / 2
          const ry = gridY

          if (ry + sensorPxH + labelH > H - pad) break

          ctx.save()
          ctx.globalAlpha = a

          const cellSize = Math.max(pitch * sensorScale * 0.25, 1.5)
          const gridColCount = Math.max(1, Math.floor(sensorPxW / cellSize))
          const gridRowCount = Math.max(1, Math.floor(sensorPxH / cellSize))
          const actualGridW = gridColCount * cellSize
          const actualGridH = gridRowCount * cellSize
          const gridOffX = rx + (sensorPxW - actualGridW) / 2
          const gridOffY = ry + (sensorPxH - actualGridH) / 2

          roundRect(ctx, rx, ry, sensorPxW, sensorPxH, 3)
          ctx.fillStyle = rgba(s.color, 0.06)
          ctx.fill()

          const maxCells = 2000
          if (gridColCount * gridRowCount <= maxCells) {
            for (let r = 0; r < gridRowCount; r++) {
              for (let c = 0; c < gridColCount; c++) {
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
            ctx.fillStyle = rgba(s.color, 0.12)
            ctx.fillRect(gridOffX, gridOffY, actualGridW, actualGridH)
            ctx.strokeStyle = rgba(s.color, 0.2)
            ctx.lineWidth = 0.5
            const step = Math.max(actualGridW / 20, 3)
            for (let lx = gridOffX; lx <= gridOffX + actualGridW; lx += step) {
              ctx.beginPath(); ctx.moveTo(lx, gridOffY); ctx.lineTo(lx, gridOffY + actualGridH); ctx.stroke()
            }
            for (let ly = gridOffY; ly <= gridOffY + actualGridH; ly += step) {
              ctx.beginPath(); ctx.moveTo(gridOffX, ly); ctx.lineTo(gridOffX + actualGridW, ly); ctx.stroke()
            }
          }

          roundRect(ctx, rx, ry, sensorPxW, sensorPxH, 3)
          ctx.strokeStyle = rgba(s.color, 0.6)
          ctx.lineWidth = 1.5
          ctx.stroke()

          ctx.fillStyle = s.color
          ctx.font = '10px system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(`${mp} MP · ${pitch.toFixed(2)} µm`, colX + colW / 2, ry + sensorPxH + 4)

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
  }

  ctx.textBaseline = 'alphabetic'
  return H
}

