'use client'

import { useRef, useCallback, Suspense, lazy } from 'react'
import { useTranslations } from 'next-intl'
import { useToolSession } from '@/lib/analytics/hooks/useToolSession'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { ToolActions } from '@/components/shared/ToolActions'
import { useMegapixelState } from './useMegapixelState'
import { useMegapixelUrlSync } from './useMegapixelUrlSync'
import { MegapixelSidebar } from './MegapixelSidebar'
import ss from './MegapixelVisualizer.module.css'

const PrintTableView = lazy(() =>
  import('./PrintTableView').then(m => ({ default: m.PrintTableView })),
)

export function MegapixelVisualizer() {
  const t = useTranslations('toolUI.megapixel-visualizer')
  const { trackParam } = useToolSession()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const state = useMegapixelState()
  useMegapixelUrlSync(state, state)

  const onReset = useCallback(() => {
    state.setVisible(new Set(['mp_12', 'mp_24', 'mp_45', 'mp_100']))
    state.setMode('overlay')
    state.setAspectId('3x2')
    state.setDpi(300)
    state.setViewingDistance('arms')
    state.setBitDepth('raw14')
    state.setCropTargetId(null)
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
            onDpiChange={(d) => { trackParam({ param_name: 'dpi', param_value: String(d), input_type: 'toggle' }); state.setDpi(d) }}
            onUnitsChange={(u) => { trackParam({ param_name: 'units', param_value: u, input_type: 'toggle' }); state.setUnits(u) }}
            onViewingDistanceChange={(d) => { trackParam({ param_name: 'viewing-distance', param_value: d, input_type: 'toggle' }); state.setViewingDistance(d) }}
            onBitDepthChange={(b) => { trackParam({ param_name: 'bit-depth', param_value: b, input_type: 'toggle' }); state.setBitDepth(b) }}
            onPrintPresetChange={(p) => { trackParam({ param_name: 'print-preset', param_value: p, input_type: 'select' }); state.setPrintPresetId(p) }}
            onPrintOrientationChange={(o) => { trackParam({ param_name: 'print-orientation', param_value: o, input_type: 'toggle' }); state.setPrintOrientation(o) }}
            onPrintFitModeChange={(f) => { trackParam({ param_name: 'print-fit-mode', param_value: f, input_type: 'toggle' }); state.setPrintFitMode(f) }}
            onCropTargetChange={(id) => { trackParam({ param_name: 'crop-target', param_value: id ?? 'none', input_type: 'select' }); state.setCropTargetId(id) }}
            onAddCustomMp={(name, mp) => { trackParam({ param_name: 'custom-mp-add', param_value: String(mp), input_type: 'button' }); state.addCustomMp(name, mp) }}
            onEditCustomMp={(id, name, mp) => { trackParam({ param_name: 'custom-mp-edit', param_value: String(mp), input_type: 'button' }); state.editCustomMp(id, name, mp) }}
            onRemoveCustomMp={(id) => { trackParam({ param_name: 'custom-mp-remove', param_value: id, input_type: 'button' }); state.removeCustomMp(id) }}
            onRemoveAllCustom={state.removeAllCustomMps}
          />
        </div>

        <div className={ss.main}>
          {state.mode !== 'print-table' ? (
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
          ) : (
            <Suspense fallback={<div className={ss.printTableWrap} />}>
              <PrintTableView />
            </Suspense>
          )}
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
