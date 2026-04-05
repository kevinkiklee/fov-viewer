'use client'

import { useReducer, useState, useEffect } from 'react'
import { ToolActions } from '@/components/shared/ToolActions'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { reducer, DEFAULT_STATE, parseQueryParams, useQuerySync } from './compressionState'
import { CompressionControls } from './CompressionControls'
import { CompressionScene } from './CompressionScene'
import styles from './PerspectiveCompressionSimulator.module.css'

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
        <aside className={styles.sidebar}>
          <ToolActions
            toolName="Perspective Compression Simulator"
            toolSlug="perspective-compression-simulator"
            onReset={() => dispatch({ type: 'RESET' })}
          />
          <CompressionControls state={state} dispatch={dispatch} />
        </aside>

        <main className={styles.canvasArea}>
          <section className={styles.canvasMain}>
            <CompressionScene
              focalLength={state.focalLength}
              sensorId={state.sensorId}
              distance={state.distance}
            />
          </section>
        </main>

        <div className={styles.desktopOnly}>
          <LearnPanel slug="perspective-compression-simulator" />
        </div>
      </div>

      <div className={styles.mobileControls}>
        <CompressionControls state={state} dispatch={dispatch} />
      </div>

      <div className={styles.mobileOnly}>
        <LearnPanel slug="perspective-compression-simulator" />
      </div>
    </div>
  )
}
