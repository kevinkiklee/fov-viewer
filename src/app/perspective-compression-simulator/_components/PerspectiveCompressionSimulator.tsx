'use client'

import { useReducer, useState, useEffect, useRef, useMemo } from 'react'
import { FOCAL_LENGTHS, FOCAL_MIN, FOCAL_MAX } from '@/lib/data/focalLengths'
import { SENSORS, getSensor } from '@/lib/data/sensors'
import { calcEquivFocalLength } from '@/lib/math/fov'
import { ToolActions } from '@/components/shared/ToolActions'
import { CompressionScene } from './CompressionScene'
import styles from './PerspectiveCompressionSimulator.module.css'

/* ─── State ─── */

interface State {
  focalLength: number   // 14-800
  sensorId: string      // sensor ID
  distance: number      // 3-100 feet
}

const DEFAULT_STATE: State = {
  focalLength: 50,
  sensorId: 'ff',
  distance: 10,
}

type Action =
  | { type: 'SET_FOCAL_LENGTH'; payload: number }
  | { type: 'SET_SENSOR'; payload: string }
  | { type: 'SET_DISTANCE'; payload: number }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: Partial<State> }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FOCAL_LENGTH':
      return { ...state, focalLength: action.payload }
    case 'SET_SENSOR':
      return { ...state, sensorId: action.payload }
    case 'SET_DISTANCE':
      return { ...state, distance: action.payload }
    case 'RESET':
      return { ...DEFAULT_STATE }
    case 'HYDRATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

/* ─── URL sync ─── */

const SENSOR_IDS = new Set(SENSORS.map((s) => s.id))

function parseQueryParams(): Partial<State> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const state: Partial<State> = {}

  const fl = Number(params.get('fl'))
  if (fl >= 14 && fl <= 800) state.focalLength = Math.round(fl)

  const s = params.get('s')
  if (s && SENSOR_IDS.has(s)) state.sensorId = s

  const dist = Number(params.get('dist'))
  if (Number.isInteger(dist) && dist >= 3 && dist <= 100) state.distance = dist

  return state
}

function stateToQueryString(state: State): string {
  const params = new URLSearchParams()
  params.set('fl', String(state.focalLength))
  params.set('s', state.sensorId)
  if (state.distance !== 10) params.set('dist', String(state.distance))
  return params.toString()
}

function useQuerySync(state: State): void {
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

/* ─── Logarithmic focal length slider ─── */

const LOG_MIN = Math.log(14)
const LOG_MAX = Math.log(FOCAL_MAX)
const SLIDER_STEPS = 1000

function focalToSlider(focal: number): number {
  return Math.round(((Math.log(focal) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * SLIDER_STEPS)
}

function sliderToFocal(pos: number): number {
  return Math.round(Math.exp(LOG_MIN + (pos / SLIDER_STEPS) * (LOG_MAX - LOG_MIN)))
}

const SNAP_THRESHOLD = 15

/* ─── Logarithmic distance slider ─── */

const DIST_MIN = 3
const DIST_MAX = 100
const LOG_DIST_MIN = Math.log(DIST_MIN)
const LOG_DIST_MAX = Math.log(DIST_MAX)
const DIST_SLIDER_STEPS = 500

function distToSlider(dist: number): number {
  return Math.round(((Math.log(dist) - LOG_DIST_MIN) / (LOG_DIST_MAX - LOG_DIST_MIN)) * DIST_SLIDER_STEPS)
}

function sliderToDist(pos: number): number {
  return Math.round(Math.exp(LOG_DIST_MIN + (pos / DIST_SLIDER_STEPS) * (LOG_DIST_MAX - LOG_DIST_MIN)))
}

const DIST_PRESETS = [5, 10, 25, 50]

/* ─── Sidebar controls (shared between desktop and mobile) ─── */

interface ControlsProps {
  state: State
  dispatch: React.Dispatch<Action>
}

function Controls({ state, dispatch }: ControlsProps) {
  const sensor = getSensor(state.sensorId)
  const isCrop = sensor.cropFactor > 1
  const minFocal = isCrop ? FOCAL_MIN : 14
  const equiv = calcEquivFocalLength(state.focalLength, sensor.cropFactor)

  const sliderMin = focalToSlider(Math.max(minFocal, 14))
  const sliderVal = focalToSlider(Math.max(state.focalLength, minFocal))

  const presetPositions = useMemo(
    () => FOCAL_LENGTHS.filter((fl) => fl.value >= minFocal).map((fl) => ({
      value: fl.value,
      pct: ((focalToSlider(fl.value) - sliderMin) / (SLIDER_STEPS - sliderMin)) * 100,
    })),
    [minFocal, sliderMin],
  )

  const handleFocalSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pos = Number(e.target.value)
    let focal = sliderToFocal(pos)

    for (const fl of FOCAL_LENGTHS) {
      if (fl.value < minFocal) continue
      const presetPos = focalToSlider(fl.value)
      if (Math.abs(pos - presetPos) <= SNAP_THRESHOLD) {
        focal = fl.value
        break
      }
    }

    focal = Math.max(minFocal, Math.min(FOCAL_MAX, focal))
    dispatch({ type: 'SET_FOCAL_LENGTH', payload: focal })
  }

  const handleDistSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pos = Number(e.target.value)
    let dist = sliderToDist(pos)
    dist = Math.max(DIST_MIN, Math.min(DIST_MAX, dist))
    dispatch({ type: 'SET_DISTANCE', payload: dist })
  }

  return (
    <>
      {/* Focal Length panel */}
      <div className={styles.panel}>
        <div className={styles.title}>Focal Length</div>
        <div className={styles.row}>
          <span className={styles.sublabel}>Focal length</span>
          <span className={styles.value}>{state.focalLength}mm</span>
        </div>
        {sensor.cropFactor !== 1 && (
          <div className={styles.row}>
            <span className={styles.sublabel}>Equiv.</span>
            <span className={styles.value}>{equiv}mm</span>
          </div>
        )}
        <div className={styles.sliderWrap}>
          <input
            type="range"
            className={styles.slider}
            min={sliderMin}
            max={SLIDER_STEPS}
            step={1}
            value={sliderVal}
            onChange={handleFocalSlider}
            aria-label={`Focal length: ${state.focalLength}mm`}
          />
        </div>
        <div className={styles.presets}>
          {FOCAL_LENGTHS.filter((fl) => fl.value >= minFocal).map((fl) => (
            <button
              key={fl.value}
              className={`${styles.preset} ${state.focalLength === fl.value ? styles.presetActive : ''}`}
              onClick={() => dispatch({ type: 'SET_FOCAL_LENGTH', payload: fl.value })}
            >
              {fl.value}mm
            </button>
          ))}
        </div>

        <div className={styles.row}>
          <span className={styles.sublabel}>Sensor</span>
          <select
            className={styles.select}
            value={state.sensorId}
            aria-label="Sensor"
            onChange={(e) => {
              const newSensor = getSensor(e.target.value)
              const newMin = newSensor.cropFactor > 1 ? FOCAL_MIN : 14
              dispatch({ type: 'SET_SENSOR', payload: e.target.value })
              if (state.focalLength < newMin) {
                dispatch({ type: 'SET_FOCAL_LENGTH', payload: newMin })
              }
            }}
          >
            {SENSORS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.cropFactor}x)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Distance panel */}
      <div className={styles.panel}>
        <div className={styles.title}>Subject Distance</div>
        <div className={styles.row}>
          <span className={styles.sublabel}>Distance</span>
          <span className={styles.value}>{state.distance} ft</span>
        </div>
        <div className={styles.sliderWrap}>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={DIST_SLIDER_STEPS}
            step={1}
            value={distToSlider(state.distance)}
            onChange={handleDistSlider}
            aria-label={`Subject distance: ${state.distance} ft`}
          />
        </div>
        <div className={styles.presets}>
          {DIST_PRESETS.map((d) => (
            <button
              key={d}
              className={`${styles.preset} ${state.distance === d ? styles.presetActive : ''}`}
              onClick={() => dispatch({ type: 'SET_DISTANCE', payload: d })}
            >
              {d} ft
            </button>
          ))}
        </div>
      </div>

      <button className={styles.resetBtn} onClick={() => dispatch({ type: 'RESET' })}>
        Reset
      </button>
    </>
  )
}

/* ─── Main component ─── */

export function PerspectiveCompressionSimulator() {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)
  const [hydrated, setHydrated] = useState(false)

  useQuerySync(state)

  useEffect(() => {
    if (hydrated) return
    setHydrated(true)
    const queryOverrides = parseQueryParams()
    if (Object.keys(queryOverrides).length > 0) {
      dispatch({ type: 'HYDRATE', payload: queryOverrides })
    }
  }, [hydrated])

  return (
    <div className={styles.app}>
      <div className={styles.appBody}>
        {/* Desktop sidebar */}
        <aside className={styles.sidebar}>
          <ToolActions toolName="Perspective Compression Simulator" toolSlug="perspective-compression-simulator" />
          <Controls state={state} dispatch={dispatch} />
        </aside>

        {/* Canvas area */}
        <main className={styles.canvasArea}>
          <section className={styles.canvasMain}>
            <CompressionScene
              focalLength={state.focalLength}
              sensorId={state.sensorId}
              distance={state.distance}
            />
          </section>
        </main>
      </div>

      {/* Mobile controls */}
      <div className={styles.mobileControls}>
        <Controls state={state} dispatch={dispatch} />
      </div>
    </div>
  )
}
