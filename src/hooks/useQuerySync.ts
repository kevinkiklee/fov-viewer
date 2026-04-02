import { useEffect, useRef } from 'react'
import type { AppState, LensConfig } from '../types'
import { SENSORS } from '../data/sensors'

const SENSOR_IDS = new Set(SENSORS.map((s) => s.id))
const LENS_KEYS = ['a', 'b', 'c'] as const
const SENSOR_KEYS = ['sa', 'sb', 'sc'] as const

function clampFocal(v: number): number {
  return Math.max(8, Math.min(800, Math.round(v)))
}

function parseLens(params: URLSearchParams, fKey: string, sKey: string): LensConfig | null {
  const f = Number(params.get(fKey))
  if (!f || f < 8 || f > 800) return null
  const lens: LensConfig = { focalLength: clampFocal(f), sensorId: 'ff' }
  const s = params.get(sKey)
  if (s && SENSOR_IDS.has(s)) lens.sensorId = s
  return lens
}

export function parseQueryParams(): Partial<AppState> {
  const params = new URLSearchParams(window.location.search)
  const state: Partial<AppState> = {}

  const lenses: LensConfig[] = []
  for (let i = 0; i < 3; i++) {
    const lens = parseLens(params, LENS_KEYS[i], SENSOR_KEYS[i])
    if (lens) lenses.push(lens)
  }
  if (lenses.length > 0) state.lenses = lenses

  const img = Number(params.get('img'))
  if (!isNaN(img) && img >= 0 && img <= 4) state.imageIndex = img

  const theme = params.get('theme')
  if (theme === 'dark' || theme === 'light') state.theme = theme

  return state
}

export function stateToQueryString(state: AppState): string {
  const params = new URLSearchParams()
  state.lenses.forEach((lens, i) => {
    params.set(LENS_KEYS[i], String(lens.focalLength))
    params.set(SENSOR_KEYS[i], lens.sensorId)
  })
  params.set('img', String(state.imageIndex))
  params.set('theme', state.theme)
  return params.toString()
}

export function useQuerySync(state: AppState): void {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const qs = stateToQueryString(state)
    const newUrl = `${window.location.pathname}?${qs}`
    window.history.replaceState(null, '', newUrl)
  }, [state])
}
