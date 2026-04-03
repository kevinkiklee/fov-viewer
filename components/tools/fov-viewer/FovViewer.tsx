'use client'

import { useReducer, useRef, useCallback, useState } from 'react'
import type { LensConfig } from '@/lib/types'
import type { FovViewerState, Orientation } from './types'
import { DEFAULT_FOV_STATE, LENS_COLORS, LENS_LABELS, MAX_LENSES } from './types'
import { parseQueryParams, useQuerySync } from './querySync'
import { copyCanvasToClipboard, copyLinkToClipboard } from '@/lib/utils/export'
import { Toast } from '@/components/shared/Toast'

import { Sidebar } from './Sidebar'
import { LensPanel } from './LensPanel'
import { SceneStrip } from './SceneStrip'
import { ActionBar } from './ActionBar'
import { Canvas } from './Canvas'
import { ShareModal } from './ShareModal'
import styles from './FovViewer.module.css'

type Action =
  | { type: 'SET_LENS'; payload: { index: number; updates: Partial<LensConfig> } }
  | { type: 'ADD_LENS' }
  | { type: 'REMOVE_LENS'; payload: number }
  | { type: 'SET_IMAGE'; payload: number }
  | { type: 'SET_ACTIVE_LENS'; payload: number }
  | { type: 'SET_ORIENTATION'; payload: Orientation }
  | { type: 'RESET' }

const NEW_LENS_DEFAULTS: LensConfig[] = [
  { focalLength: 85, sensorId: 'ff' },
  { focalLength: 200, sensorId: 'ff' },
]

function reducer(state: FovViewerState, action: Action): FovViewerState {
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
    case 'RESET':
      return { ...DEFAULT_FOV_STATE }
    default:
      return state
  }
}

function getInitialState(): FovViewerState {
  if (typeof window === 'undefined') return DEFAULT_FOV_STATE
  const queryOverrides = parseQueryParams()
  const orientation = queryOverrides.orientation
    ?? (window.innerWidth < 1024 ? 'portrait' : 'landscape')
  return {
    ...DEFAULT_FOV_STATE,
    ...queryOverrides,
    orientation,
  }
}

export function FovViewer() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  const [toast, setToast] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})
  const [showShare, setShowShare] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useQuerySync(state)

  const handleCopyImage = useCallback(async () => {
    if (!canvasRef.current) return
    const success = await copyCanvasToClipboard(canvasRef.current)
    setToast(success ? 'Copied image!' : 'Failed to copy')
  }, [])

  const handleCopyLink = useCallback(async () => {
    const success = await copyLinkToClipboard()
    setToast(success ? 'Link copied!' : 'Failed to copy')
  }, [])

  return (
    <div className={styles.app}>
      <div className={styles.appBody}>
      <Sidebar>
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
            className={styles.addLensBtn}
            onClick={() => dispatch({ type: 'ADD_LENS' })}
          >
            + Add lens
          </button>
        )}

        <ActionBar
          onCopyImage={handleCopyImage}
          onCopyLink={handleCopyLink}
          onReset={() => dispatch({ type: 'RESET' })}
          onShare={() => setShowShare(true)}
        />
      </Sidebar>

      <main className={styles.canvasArea}>
        <nav className={styles.canvasTopbar}>
          <SceneStrip
            selectedIndex={state.imageIndex}
            onChange={(i) => dispatch({ type: 'SET_IMAGE', payload: i })}
          />
          <button
            className={`${styles.iconBtn} ${styles.iconBtnLabeled}`}
            onClick={() => dispatch({
              type: 'SET_ORIENTATION',
              payload: state.orientation === 'landscape' ? 'portrait' : 'landscape',
            })}
            title={state.orientation === 'landscape' ? 'Switch to portrait' : 'Switch to landscape'}
          >
            {state.orientation === 'landscape' ? '\u25af' : '\u25ad'} Rotate
          </button>
          <button className={`${styles.iconBtn} ${styles.iconBtnLabeled}`} onClick={() => canvasRef.current?.dispatchEvent(new CustomEvent('center-overlays'))} title="Center overlays">
            \u229e Center
          </button>
        </nav>

        <section className={styles.canvasMain}>
          <Canvas
            lenses={state.lenses}
            imageIndex={state.imageIndex}
            orientation={state.orientation}
            canvasRef={canvasRef}
          />
        </section>
      </main>
      </div>

      {showShare && (
        <ShareModal
          state={state}
          onClose={() => setShowShare(false)}
          onToast={(msg) => { setToast(msg); setShowShare(false) }}
        />
      )}
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}
