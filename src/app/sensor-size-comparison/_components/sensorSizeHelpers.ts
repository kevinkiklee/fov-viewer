import type { SensorPreset } from '@/lib/types'
import { SENSORS, COMMON_MP, calcCropFactor } from '@/lib/data/sensors'
import { CUSTOM_COLORS, STORAGE_KEY } from './sensorSizeTypes'
import type { StoredCustomSensor } from './sensorSizeTypes'

export let customColorIdx = 0
export function setCustomColorIdx(n: number) { customColorIdx = n }

export const ALL_SENSOR_IDS = SENSORS.map((s) => s.id)
export const ALL_SENSOR_ID_SET = new Set(ALL_SENSOR_IDS)

export function gcd(a: number, b: number): number {
  a = Math.round(a * 10)
  b = Math.round(b * 10)
  while (b) { [a, b] = [b, a % b] }
  return a
}

export function formatAspectRatio(w: number, h: number): string {
  const g = gcd(w, h)
  const rw = Math.round(w * 10 / g)
  const rh = Math.round(h * 10 / g)
  const ratio = w / h
  if (Math.abs(ratio - 3 / 2) < 0.02) return '3:2'
  if (Math.abs(ratio - 4 / 3) < 0.02) return '4:3'
  if (Math.abs(ratio - 16 / 9) < 0.02) return '16:9'
  if (Math.abs(ratio - 5 / 4) < 0.02) return '5:4'
  if (Math.abs(ratio - 1) < 0.02) return '1:1'
  return `${rw}:${rh}`
}

export function rgba(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${a})`
}

export function roundRect(
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

export function easeOut(t: number): number {
  return 1 - (1 - t) ** 3
}

export function encodeCustomParam(sensors: Required<SensorPreset>[]): string {
  return sensors.map(s => {
    const mp = COMMON_MP[s.id]?.[0]?.mp ?? 0
    return `${s.name}~${s.w}~${s.h}~${mp}`
  }).join(',')
}

export function decodeCustomParam(raw: string): Required<SensorPreset>[] {
  if (!raw) return []
  return raw.split(',').map((entry, i) => {
    const [name, ws, hs, mps] = entry.split('~')
    const w = parseFloat(ws)
    const h = parseFloat(hs)
    const mp = parseFloat(mps) || 0
    if (!name || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null
    const id = `custom_url_${i}`
    const color = CUSTOM_COLORS[i % CUSTOM_COLORS.length]
    const cropFactor = calcCropFactor(w, h)
    if (mp > 0) COMMON_MP[id] = [{ mp, models: name }]
    return { id, name, w, h, cropFactor, color } as Required<SensorPreset>
  }).filter(Boolean) as Required<SensorPreset>[]
}

export function loadCustomSensors(): Required<SensorPreset>[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const stored: StoredCustomSensor[] = JSON.parse(raw)
    for (const s of stored) {
      if (s.mp && s.mp > 0) {
        COMMON_MP[s.id] = [{ mp: s.mp, models: s.name }]
      }
    }
    customColorIdx = stored.length
    return stored.map(s => ({ id: s.id, name: s.name, w: s.w, h: s.h, cropFactor: s.cropFactor, color: s.color }))
  } catch { return [] }
}

export function saveCustomSensors(sensors: Required<SensorPreset>[]) {
  try {
    const stored: StoredCustomSensor[] = sensors.map(s => ({
      id: s.id, name: s.name, w: s.w, h: s.h, cropFactor: s.cropFactor, color: s.color,
      mp: COMMON_MP[s.id]?.[0]?.mp,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch { /* ignore */ }
}
