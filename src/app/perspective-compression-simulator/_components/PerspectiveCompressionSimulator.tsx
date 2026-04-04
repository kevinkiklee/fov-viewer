'use client'

import { useReducer, useState, useEffect, useRef } from 'react'
import { FOCAL_LENGTHS, FOCAL_MIN, FOCAL_MAX } from '@/lib/data/focalLengths'
import { SENSORS, getSensor } from '@/lib/data/sensors'
import { calcEquivFocalLength } from '@/lib/math/fov'
import { ToolActions } from '@/components/shared/ToolActions'
import { InfoTooltip } from '@/components/shared/InfoTooltip'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { getEducationBySlug } from '@/lib/data/education'
import { calcCameraDistance } from '@/lib/math/compression'
import { CompressionScene } from './CompressionScene'
import styles from './PerspectiveCompressionSimulator.module.css'

/* ─── State ─── */

interface State {
  focalLength: number         // 14-800mm
  sensorId: string            // sensor ID
  distance: number            // Actual distance in feet
  maintainSubjectSize: boolean
}

const DEFAULT_STATE: State = {
  focalLength: 50,
  sensorId: 'ff',
  distance: 15,
  maintainSubjectSize: true,
}

type Action =
  | { type: 'SET_FOCAL_LENGTH'; payload: number }
  | { type: 'SET_SENSOR'; payload: string }
  | { type: 'SET_DISTANCE'; payload: number }
  | { type: 'SET_MAINTAIN_SIZE'; payload: boolean }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: Partial<State> }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FOCAL_LENGTH': {
      const newFocal = action.payload
      if (state.maintainSubjectSize && state.focalLength > 0) {
        const newDistance = calcCameraDistance(newFocal, state.focalLength, state.distance)
        return { ...state, focalLength: newFocal, distance: Math.max(3, Math.min(500, newDistance)) }
      }
      return { ...state, focalLength: newFocal }
    }
    case 'SET_SENSOR':
      return { ...state, sensorId: action.payload }
    case 'SET_DISTANCE':
      return { ...state, distance: action.payload }
    case 'SET_MAINTAIN_SIZE':
      return { ...state, maintainSubjectSize: action.payload }
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
  if (!isNaN(dist) && dist >= 3 && dist <= 500) state.distance = dist

  const m = params.get('m')
  if (m === '1') state.maintainSubjectSize = true
  if (m === '0') state.maintainSubjectSize = false

  return state
}

function stateToQueryString(state: State): string {
  const params = new URLSearchParams()
  params.set('fl', String(state.focalLength))
  params.set('s', state.sensorId)
  params.set('dist', state.distance.toFixed(1))
  params.set('m', state.maintainSubjectSize ? '1' : '0')
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
const DIST_MAX = 500
const LOG_DIST_MIN = Math.log(DIST_MIN)
const LOG_DIST_MAX = Math.log(DIST_MAX)
const DIST_SLIDER_STEPS = 500

function distToSlider(dist: number): number {
  const clamped = Math.max(DIST_MIN, Math.min(DIST_MAX, dist))
  return Math.round(((Math.log(clamped) - LOG_DIST_MIN) / (LOG_DIST_MAX - LOG_DIST_MIN)) * DIST_SLIDER_STEPS)
}

function sliderToDist(pos: number): number {
  return Math.exp(LOG_DIST_MIN + (pos / DIST_SLIDER_STEPS) * (LOG_DIST_MAX - LOG_DIST_MIN))
}

const DIST_PRESETS = [5, 15, 50, 150]

/* ─── Sidebar controls (shared between desktop and mobile) ─── */

interface ControlsProps {
  state: State
  dispatch: React.Dispatch<Action>
}

function Controls({ state, dispatch }: ControlsProps) {
  const education = getEducationBySlug('perspective-compression-simulator')
  const tooltips = education?.tooltips

  const sensor = getSensor(state.sensorId)
  const isCrop = sensor.cropFactor > 1
  const minFocal = isCrop ? FOCAL_MIN : 14
  const equiv = calcEquivFocalLength(state.focalLength, sensor.cropFactor)

  const sliderMin = focalToSlider(Math.max(minFocal, 14))
  const sliderVal = focalToSlider(Math.max(state.focalLength, minFocal))

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
        <div className={styles.title}>Camera Settings</div>
        
        <div className={styles.row}>
          <span className={styles.sublabel}>
            Focal Length
            {tooltips?.focalLength && <InfoTooltip tooltip={tooltips.focalLength} />}
          </span>
          <span className={styles.value}>{state.focalLength}mm</span>
        </div>
        
        {sensor.cropFactor !== 1 && (
          <div className={styles.row}>
            <span className={styles.sublabel}>Equivalent (35mm)</span>
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
          {[24, 35, 50, 85, 135, 200, 400].filter(fl => fl >= minFocal).map((fl) => (
            <button
              key={fl}
              className={`${styles.preset} ${state.focalLength === fl ? styles.presetActive : ''}`}
              onClick={() => dispatch({ type: 'SET_FOCAL_LENGTH', payload: fl })}
            >
              {fl}mm
            </button>
          ))}
        </div>

        <div className={styles.row} style={{ marginTop: '16px' }}>
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
        <div className={styles.title}>Perspective & Distance</div>
        
        <div className={styles.row}>
          <span className={styles.sublabel}>
            Subject Distance
            {tooltips?.distance && <InfoTooltip tooltip={tooltips.distance} />}
          </span>
          <span className={styles.value}>{state.distance.toFixed(1)} ft</span>
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
            aria-label={`Subject distance: ${state.distance.toFixed(1)} ft`}
          />
        </div>

        <div className={styles.presets}>
          {DIST_PRESETS.map((d) => (
            <button
              key={d}
              className={`${styles.preset} ${Math.abs(state.distance - d) < 0.1 ? styles.presetActive : ''}`}
              onClick={() => dispatch({ type: 'SET_DISTANCE', payload: d })}
            >
              {d} ft
            </button>
          ))}
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleLabel}>
            Maintain Subject Size
            {tooltips?.maintainSize && <InfoTooltip tooltip={tooltips.maintainSize} />}
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={state.maintainSubjectSize}
              onChange={(e) => dispatch({ type: 'SET_MAINTAIN_SIZE', payload: e.target.checked })}
            />
            <span className={styles.slider_round}></span>
          </label>
        </div>
      </div>

      <button className={styles.resetBtn} onClick={() => dispatch({ type: 'RESET' })}>
        Reset All
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
          <ToolActions 
            toolName="Perspective Compression Simulator" 
            toolSlug="perspective-compression-simulator" 
            onReset={() => dispatch({ type: 'RESET' })}
          />
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

        {/* Desktop: LearnPanel as right sidebar */}
        <div className={styles.desktopOnly}>
          <LearnPanel slug="perspective-compression-simulator" />
        </div>
      </div>

      {/* Mobile controls */}
      <div className={styles.mobileControls}>
        <Controls state={state} dispatch={dispatch} />
      </div>

      {/* Mobile: LearnPanel below controls */}
      <div className={styles.mobileOnly}>
        <LearnPanel slug="perspective-compression-simulator" />
      </div>
    </div>
  )
}
