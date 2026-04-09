'use client'

import { useRef, useCallback, Suspense, lazy, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useToolSession } from '@/lib/analytics/hooks/useToolSession'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import { useMegapixelState } from './useMegapixelState'
import { useMegapixelUrlSync } from './useMegapixelUrlSync'
import { MegapixelSidebar } from './MegapixelSidebar'
import { TableControls } from './TableControls'
import { drawOverlay } from './drawOverlay'
import { drawSideBySide } from './drawSideBySide'
import { drawScaleBar } from './drawScaleBar'
import { getAspect } from '@/lib/data/aspectRatios'
import { FIXED_DPI } from './megapixelTypes'
import ss from './MegapixelVisualizer.module.css'

const PrintTableView = lazy(() =>
  import('./PrintTableView').then(m => ({ default: m.PrintTableView })),
)

export function MegapixelVisualizer() {
  const t = useTranslations('toolUI.megapixel-visualizer')
  const { trackParam } = useToolSession()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  const state = useMegapixelState()
  useMegapixelUrlSync(state, state)

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { willReadFrequently: false })
    }
    const ctx = ctxRef.current
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const cssWidth = canvas.clientWidth
    const cssHeight = canvas.clientHeight
    if (cssWidth === 0 || cssHeight === 0) return

    canvas.width = cssWidth * dpr
    canvas.height = cssHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssWidth, cssHeight)

    const padding = 30
    const aspect = getAspect(state.aspectId)
    let result: { contentHeight: number; pxPerMm: number } = { contentHeight: cssHeight, pxPerMm: 0 }

    if (state.mode === 'overlay') {
      result = drawOverlay(
        ctx, cssWidth, cssHeight, padding,
        state.visibleMps, aspect, FIXED_DPI, state.units, state.hoveredMpId,
      )
    } else if (state.mode === 'side-by-side') {
      result = drawSideBySide(
        ctx, cssWidth, cssHeight, padding,
        state.visibleMps, aspect, FIXED_DPI, state.units,
      )
    }

    if (result.pxPerMm > 0) {
      drawScaleBar(ctx, cssWidth, cssHeight, result.pxPerMm, state.units)
    }

    canvas.dataset.rendered = 'true'
  }, [state])

  useEffect(() => {
    drawFrame()
  }, [drawFrame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => drawFrame())
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [drawFrame])

  const onReset = useCallback(() => {
    state.setVisible(new Set(['mp_12', 'mp_24', 'mp_45', 'mp_100']))
    state.setMode('overlay')
    state.setAspectId('3x2')
    state.setViewingDistance('arms')
    state.setBitDepth('raw14')
  }, [state])

  return (
    <div className={ss.app}>
      <h1 className={ss.visuallyHidden}>{t('pageHeading')}</h1>
      <div className={ss.appBody}>
        <div className={ss.sidebar}>
          <ToolActions
            toolSlug="megapixel-visualizer"
            canvasRef={canvasRef}
            imageFilename="megapixel-comparison.png"
            onReset={onReset}
          />
          <MegapixelSidebar
            {...state}
            onToggleMp={(id) => { trackParam({ param_name: 'mp', param_value: id, input_type: 'toggle' }); state.toggleMp(id) }}
            onModeChange={(m) => { trackParam({ param_name: 'mode', param_value: m, input_type: 'toggle' }); state.setMode(m) }}
            onAspectChange={(a) => { trackParam({ param_name: 'aspect', param_value: a, input_type: 'toggle' }); state.setAspectId(a) }}
            onUnitsChange={(u) => { trackParam({ param_name: 'units', param_value: u, input_type: 'toggle' }); state.setUnits(u) }}
            onAddCustomMp={(name, mp) => { trackParam({ param_name: 'custom-mp-add', param_value: String(mp), input_type: 'button' }); state.addCustomMp(name, mp) }}
            onEditCustomMp={(id, name, mp) => { trackParam({ param_name: 'custom-mp-edit', param_value: String(mp), input_type: 'button' }); state.editCustomMp(id, name, mp) }}
            onRemoveCustomMp={(id) => { trackParam({ param_name: 'custom-mp-remove', param_value: id, input_type: 'button' }); state.removeCustomMp(id) }}
            onRemoveAllCustom={state.removeAllCustomMps}
          />
        </div>

        <div className={ss.main}>
          <div className={ss.canvasWrap}>
            <canvas
              ref={canvasRef}
              className={ss.canvas}
              role="img"
              aria-label={t('canvasAriaLabel', { mode: state.mode, count: state.visible.size })}
            />
            <svg className={ss.skeletonOverlay} aria-hidden="true" viewBox="0 0 400 300">
              <rect x="80" y="60" width="240" height="160" stroke="#3b82f6" fill="none" strokeWidth="2" />
              <rect x="120" y="90" width="160" height="110" stroke="#f59e0b" fill="none" strokeWidth="2" />
              <rect x="150" y="110" width="100" height="70"  stroke="#10b981" fill="none" strokeWidth="2" />
              <rect x="170" y="125" width="60"  height="40"  stroke="#64748b" fill="none" strokeWidth="2" />
            </svg>
          </div>

          <TableControls
            viewingDistance={state.viewingDistance}
            bitDepth={state.bitDepth}
            onViewingDistanceChange={(d) => { trackParam({ param_name: 'viewing-distance', param_value: d, input_type: 'toggle' }); state.setViewingDistance(d) }}
            onBitDepthChange={(b) => { trackParam({ param_name: 'bit-depth', param_value: b, input_type: 'toggle' }); state.setBitDepth(b) }}
          />

          <Suspense fallback={<div className={ss.printTableWrap} />}>
            <PrintTableView
              visibleMps={state.visibleMps}
              aspectId={state.aspectId}
              units={state.units}
              viewingDistance={state.viewingDistance}
              bitDepth={state.bitDepth}
            />
          </Suspense>
        </div>

        <div className={`${ss.learnPanelWrap} ${ss.desktopOnly}`}>
          <LearnPanel slug="megapixel-visualizer" />
        </div>
      </div>
      <div className={ss.mobileOnly}>
        <LearnPanel slug="megapixel-visualizer" />
      </div>
    </div>
  )
}
