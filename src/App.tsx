import { useReducer, useRef, useCallback, useState } from 'react'
import './theme.css'
import './App.css'
import type { AppState, LensConfig, Orientation } from './types'
import { DEFAULT_STATE, LENS_COLORS, LENS_LABELS, MAX_LENSES } from './types'
import { parseQueryParams, useQuerySync } from './hooks/useQuerySync'
import { useDynamicMeta } from './hooks/useDynamicMeta'

import { copyCanvasToClipboard, copyLinkToClipboard } from './utils/export'
import { Sidebar } from './components/Sidebar'
import { LensPanel } from './components/LensPanel'
import { ThemeToggle } from './components/ThemeToggle'
import { SceneStrip } from './components/SceneStrip'
import { ActionBar } from './components/ActionBar'
import { Canvas } from './components/Canvas'

import { Toast } from './components/Toast'

type Action =
  | { type: 'SET_LENS'; payload: { index: number; updates: Partial<LensConfig> } }
  | { type: 'ADD_LENS' }
  | { type: 'REMOVE_LENS'; payload: number }
  | { type: 'SET_IMAGE'; payload: number }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_ACTIVE_LENS'; payload: number }
  | { type: 'SET_ORIENTATION'; payload: Orientation }
  | { type: 'RESET' }

const NEW_LENS_DEFAULTS: LensConfig[] = [
  { focalLength: 85, sensorId: 'ff' },
  { focalLength: 200, sensorId: 'ff' },
]

function reducer(state: AppState, action: Action): AppState {
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
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_ACTIVE_LENS':
      return { ...state, activeLens: action.payload }
    case 'SET_ORIENTATION':
      return { ...state, orientation: action.payload }
    case 'RESET':
      return { ...DEFAULT_STATE, theme: state.theme }
    default:
      return state
  }
}

function getInitialState(): AppState {
  const savedTheme = localStorage.getItem('fov-theme') as 'dark' | 'light' | null
  const queryOverrides = parseQueryParams()
  return {
    ...DEFAULT_STATE,
    ...(savedTheme ? { theme: savedTheme } : {}),
    ...queryOverrides,
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  const [toast, setToast] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useQuerySync(state)
  useDynamicMeta(state.lenses)

  document.documentElement.setAttribute('data-theme', state.theme)
  localStorage.setItem('fov-theme', state.theme)

  const handleCopyImage = useCallback(async () => {
    if (!canvasRef.current) return
    const success = await copyCanvasToClipboard(canvasRef.current)
    setToast(success ? 'Copied image!' : 'Failed to copy')
  }, [])

  const handleCopyLink = useCallback(() => {
    const success = copyLinkToClipboard()
    setToast(success ? 'Link copied!' : 'Failed to copy')
  }, [])

  return (
    <div className="app">
      <Sidebar>
        <header className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon" />
            <span className="sidebar__logo-text">FOV Viewer</span>
          </div>
          <div className="sidebar__actions mobile-only">
            <button
              className="icon-btn icon-btn--labeled"
              onClick={() => dispatch({
                type: 'SET_ORIENTATION',
                payload: state.orientation === 'landscape' ? 'portrait' : 'landscape',
              })}
              title={state.orientation === 'landscape' ? 'Switch to portrait' : 'Switch to landscape'}
            >
              {state.orientation === 'landscape' ? '▯' : '▭'} Rotate
            </button>
            <button className="icon-btn icon-btn--labeled" onClick={() => canvasRef.current?.dispatchEvent(new CustomEvent('center-overlays'))} title="Center overlays">
              ⊞ Center
            </button>
            <ThemeToggle
              theme={state.theme}
              onChange={(t) => dispatch({ type: 'SET_THEME', payload: t })}
            />
          </div>
        </header>

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
          <button
            className="add-lens-btn"
            onClick={() => dispatch({ type: 'ADD_LENS' })}
          >
            + Add lens
          </button>
        )}

        <ActionBar
          onCopyImage={handleCopyImage}
          onCopyLink={handleCopyLink}
          onReset={() => dispatch({ type: 'RESET' })}
        />
      </Sidebar>

      <main className="canvas-area">
        <nav className="canvas-topbar">
          <SceneStrip
            selectedIndex={state.imageIndex}
            onChange={(i) => dispatch({ type: 'SET_IMAGE', payload: i })}
          />
          <div className="desktop-only" style={{ display: 'contents' }}>
            <button
              className="icon-btn icon-btn--labeled"
              onClick={() => dispatch({
                type: 'SET_ORIENTATION',
                payload: state.orientation === 'landscape' ? 'portrait' : 'landscape',
              })}
              title={state.orientation === 'landscape' ? 'Switch to portrait' : 'Switch to landscape'}
            >
              {state.orientation === 'landscape' ? '▯' : '▭'} Rotate
            </button>
            <button className="icon-btn icon-btn--labeled" onClick={() => canvasRef.current?.dispatchEvent(new CustomEvent('center-overlays'))} title="Center overlays">
              ⊞ Center
            </button>
            <ThemeToggle
              theme={state.theme}
              onChange={(t) => dispatch({ type: 'SET_THEME', payload: t })}
            />
          </div>
        </nav>

        <section className="canvas-main">
          <Canvas
            lenses={state.lenses}
            imageIndex={state.imageIndex}
            orientation={state.orientation}
            canvasRef={canvasRef}
          />
        </section>
      </main>


      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}

export default App
