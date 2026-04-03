'use client'

import { useReducer, useRef, useCallback, useState, useEffect } from 'react'
import type { LensConfig } from '@/lib/types'
import type { FovSimulatorState, Orientation } from './types'
import { DEFAULT_FOV_STATE, LENS_COLORS, LENS_LABELS, MAX_LENSES } from './types'
import { parseQueryParams, useQuerySync } from './querySync'
import { useTheme } from '@/components/layout/ThemeProvider'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LearnPanel } from '@/components/shared/LearnPanel'


import { ToolActions } from '@/components/shared/ToolActions'
import { Sidebar } from './Sidebar'
import { LensPanel } from './LensPanel'
import { SCENES } from '@/lib/data/scenes'
import { ScenePicker } from '@/components/shared/ScenePicker'
import { Canvas, type OverlayOffsets } from './Canvas'
import { CropStrip } from './CropStrip'
import styles from './FovSimulator.module.css'

type Action =
  | { type: 'SET_LENS'; payload: { index: number; updates: Partial<LensConfig> } }
  | { type: 'ADD_LENS' }
  | { type: 'REMOVE_LENS'; payload: number }
  | { type: 'SET_IMAGE'; payload: number }
  | { type: 'SET_ACTIVE_LENS'; payload: number }
  | { type: 'SET_ORIENTATION'; payload: Orientation }
  | { type: 'SET_DISTANCE'; payload: number }
  | { type: 'SET_SHOW_GUIDES'; payload: boolean }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: Partial<FovSimulatorState> }

const NEW_LENS_DEFAULTS: LensConfig[] = [
  { focalLength: 85, sensorId: 'ff' },
  { focalLength: 200, sensorId: 'ff' },
]

function reducer(state: FovSimulatorState, action: Action): FovSimulatorState {
  switch (action.type) {
    case 'SET_LENS': {
      const { index, updates } = action.payload
      const lenses = state.lenses.map((l, i) => i === index ? { ...l, ...updates } : l)
      return { ...state, lenses }
    }
    case 'ADD_LENS': {
      if (state.lenses.length >= MAX_LENSES) return state
      const newLens = NEW_LENS_DEFAULTS[state.lenses.length - 1] ?? { focalLength: 135, sensorId: 'ff' }
      return { ...state, lenses: [...state.lenses, newLens], activeLens: state.lenses.length }
    }
    case 'REMOVE_LENS': {
      if (state.lenses.length <= 1) return state
      const lenses = state.lenses.filter((_, i) => i !== action.payload)
      const activeLens = state.activeLens >= lenses.length ? lenses.length - 1 : state.activeLens
      return { ...state, lenses, activeLens }
    }
    case 'SET_IMAGE':
      return { ...state, imageIndex: action.payload }
    case 'SET_ACTIVE_LENS':
      return { ...state, activeLens: action.payload }
    case 'SET_ORIENTATION':
      return { ...state, orientation: action.payload }
    case 'SET_DISTANCE':
      return { ...state, distance: action.payload }
    case 'SET_SHOW_GUIDES':
      return { ...state, showGuides: action.payload }
    case 'RESET':
      return { ...DEFAULT_FOV_STATE }
    case 'HYDRATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function FovSimulator() {
  const [state, dispatch] = useReducer(reducer, DEFAULT_FOV_STATE)
  const [hydrated, setHydrated] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})
  const [overlayOffsets, setOverlayOffsets] = useState<OverlayOffsets>({})
  const [cropExpanded, setCropExpanded] = useState(false)
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const cleanCanvasRef = useRef<HTMLCanvasElement>(null)
  const { theme, setTheme } = useTheme()

  const handleCustomFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (customImageSrc) URL.revokeObjectURL(customImageSrc)
    setCustomImageSrc(URL.createObjectURL(file))
    dispatch({ type: 'SET_IMAGE', payload: -1 })
  }, [customImageSrc])

  const handleCustomRemove = useCallback(() => {
    if (customImageSrc) URL.revokeObjectURL(customImageSrc)
    setCustomImageSrc(null)
    if (state.imageIndex === -1) dispatch({ type: 'SET_IMAGE', payload: 0 })
  }, [customImageSrc, state.imageIndex])

  useQuerySync(state)

  useEffect(() => {
    if (hydrated) return
    setHydrated(true)
    const queryOverrides = parseQueryParams()
    const orientation = queryOverrides.orientation
      ?? (window.innerWidth < 1024 ? 'portrait' : 'landscape')
    dispatch({ type: 'HYDRATE', payload: { ...queryOverrides, orientation } })
  }, [hydrated])

  const rotateBtn = (
    <button
      className={`${styles.iconBtn} ${styles.iconBtnLabeled}`}
      onClick={() => dispatch({
        type: 'SET_ORIENTATION',
        payload: state.orientation === 'landscape' ? 'portrait' : 'landscape',
      })}
      title={state.orientation === 'landscape' ? 'Switch to portrait' : 'Switch to landscape'}
    >
      {state.orientation === 'landscape' ? '▯' : '▭'} Rotate
    </button>
  )

  const centerBtn = (
    <button
      className={`${styles.iconBtn} ${styles.iconBtnLabeled}`}
      onClick={() => canvasRef.current?.dispatchEvent(new CustomEvent('center-overlays'))}
      title="Center overlays"
    >
      ⊞ Center
    </button>
  )

  return (
    <div className={styles.app}>
      <div className={styles.appBody}>
        {/* Desktop sidebar */}
        <Sidebar>
          <ToolActions toolName="FOV Simulator" toolSlug="fov-simulator" onReset={() => dispatch({ type: 'RESET' })} canvasRef={canvasRef} imageFilename="fov-comparison.png" />
          {state.lenses.map((lens, i) => (
            <LensPanel
              key={i}
              label={`Lens ${LENS_LABELS[i]}`}
              color={LENS_COLORS[i]}
              config={lens}
              isActive={state.activeLens === i}
              collapsed={collapsed[i] ?? false}
              onChange={(u) => dispatch({ type: 'SET_LENS', payload: { index: i, updates: u } })}
              onFocus={() => dispatch({ type: 'SET_ACTIVE_LENS', payload: i })}
              onToggleCollapse={() => setCollapsed((c) => ({ ...c, [i]: !c[i] }))}
              onRemove={state.lenses.length > 1 ? () => dispatch({ type: 'REMOVE_LENS', payload: i }) : undefined}
            />
          ))}

          {state.lenses.length < MAX_LENSES && (
            <button className={styles.addLensBtn} onClick={() => dispatch({ type: 'ADD_LENS' })}>
              + Add lens
            </button>
          )}

        </Sidebar>

        {/* Canvas area */}
        <main className={styles.canvasArea}>
          {/* Top bar: scene strip + rotate/center (desktop only) */}
          <nav className={styles.canvasTopbar}>
            <ScenePicker
              scenes={SCENES}
              selectedIndex={state.imageIndex}
              onSelect={(i) => dispatch({ type: 'SET_IMAGE', payload: i })}
              customSrc={customImageSrc}
              onCustomFile={handleCustomFile}
              onCustomRemove={handleCustomRemove}
            />
            <span className={styles.desktopOnly}>{rotateBtn}</span>
            <span className={styles.desktopOnly}>{centerBtn}</span>
          </nav>

          <section className={styles.canvasMain}>
            <Canvas
              lenses={state.lenses}
              imageIndex={state.imageIndex}
              orientation={state.orientation}
              canvasRef={canvasRef}
              cleanCanvasRef={cleanCanvasRef}
              distance={state.distance}
              showGuides={state.showGuides}
              activeLens={state.activeLens}
              offsets={overlayOffsets}
              onOffsetsChange={setOverlayOffsets}
              customImageSrc={customImageSrc}
            />
          </section>

          <CropStrip
            lenses={state.lenses}
            imageIndex={state.imageIndex}
            orientation={state.orientation}
            activeLens={state.activeLens}
            onSelectLens={(i) => dispatch({ type: 'SET_ACTIVE_LENS', payload: i })}
            offsets={overlayOffsets}
            expanded={cropExpanded}
            onToggleExpand={() => setCropExpanded((v) => !v)}
            cleanCanvasRef={cleanCanvasRef}
          />
        </main>
        <LearnPanel slug="fov-simulator" />
      </div>

      {/* Mobile toolbar below canvas: logo + rotate + center + theme */}
      <div className={styles.mobileToolbar}>
        <div className={styles.mobileToolbarLeft}>
          <span className={styles.mobileLogoIcon} />
          <span className={styles.mobileLogoText}>FOV Simulator</span>
        </div>
        <div className={styles.mobileToolbarRight}>
          {rotateBtn}
          {centerBtn}
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
      </div>

      {/* Mobile controls below toolbar */}
      <div className={styles.mobileControls}>
        <div className={styles.mobileDivider} />

        {state.lenses.map((lens, i) => (
          <LensPanel
            key={i}
            label={`Lens ${LENS_LABELS[i]}`}
            color={LENS_COLORS[i]}
            config={lens}
            isActive={state.activeLens === i}
            collapsed={collapsed[i] ?? false}
            onChange={(u) => dispatch({ type: 'SET_LENS', payload: { index: i, updates: u } })}
            onFocus={() => dispatch({ type: 'SET_ACTIVE_LENS', payload: i })}
            onToggleCollapse={() => setCollapsed((c) => ({ ...c, [i]: !c[i] }))}
            onRemove={state.lenses.length > 1 ? () => dispatch({ type: 'REMOVE_LENS', payload: i }) : undefined}
          />
        ))}

        {state.lenses.length < MAX_LENSES && (
          <button className={styles.addLensBtn} onClick={() => dispatch({ type: 'ADD_LENS' })}>
            + Add lens
          </button>
        )}

        <ToolActions toolName="FOV Simulator" toolSlug="fov-simulator" canvasRef={canvasRef} imageFilename="fov-comparison.png" />
        <div className={styles.actionBar}>
          <button className={styles.actionBarBtn} onClick={() => dispatch({ type: 'RESET' })}>
            Reset
          </button>
        </div>
      </div>

      <canvas ref={cleanCanvasRef} style={{ display: 'none' }} />
    </div>
  )
}
