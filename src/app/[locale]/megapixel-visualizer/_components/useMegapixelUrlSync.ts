'use client'

import { useMemo } from 'react'
import {
  intParam, strParam, idSetParam, useToolQuerySync, useQueryInit,
} from '@/lib/utils/querySync'
import {
  DEFAULT_VISIBLE_MP_IDS, DEFAULT_DPI,
  DPI_PRESETS, PRINT_SIZES_METRIC, PRINT_SIZES_IMPERIAL,
} from '@/lib/data/megapixelVisualizer'
import { ASPECT_RATIOS, DEFAULT_ASPECT_ID } from '@/lib/data/aspectRatios'
import type { DisplayMode } from './megapixelTypes'
import type { ViewingDistance, BitDepth } from '@/lib/math/megapixel'

type SyncableState = {
  visible: Set<string>
  mode: DisplayMode
  aspectId: string
  dpi: number
  units: 'metric' | 'imperial'
  viewingDistance: ViewingDistance
  bitDepth: BitDepth
  printPresetId: string
  printOrientation: 'landscape' | 'portrait'
  printFitMode: 'crop' | 'fit'
  cropTargetId: string | null
}

type Setters = {
  setVisible: (v: Set<string>) => void
  setMode: (m: DisplayMode) => void
  setAspectId: (a: string) => void
  setDpi: (d: number) => void
  setUnits: (u: 'metric' | 'imperial') => void
  setViewingDistance: (v: ViewingDistance) => void
  setBitDepth: (b: BitDepth) => void
  setPrintPresetId: (p: string) => void
  setPrintOrientation: (o: 'landscape' | 'portrait') => void
  setPrintFitMode: (f: 'crop' | 'fit') => void
  setCropTargetId: (id: string | null) => void
}

export function useMegapixelUrlSync(state: SyncableState, setters: Setters) {
  const allPrintIds = useMemo(
    () => [...PRINT_SIZES_METRIC, ...PRINT_SIZES_IMPERIAL].map(p => p.id),
    [],
  )
  const allAspectIds = useMemo(() => [...ASPECT_RATIOS.map(a => a.id), 'custom'], [])
  const dpiValues = useMemo(() => DPI_PRESETS.map(d => d.value), [])

  const schema = useMemo(() => ({
    show: idSetParam(DEFAULT_VISIBLE_MP_IDS),
    mode: strParam<DisplayMode>('overlay', ['overlay', 'side-by-side', 'print-preset', 'print-table']),
    aspect: strParam(DEFAULT_ASPECT_ID, allAspectIds as string[]),
    dpi: intParam(DEFAULT_DPI, Math.min(...dpiValues), Math.max(...dpiValues)),
    units: strParam<'metric' | 'imperial'>(state.units, ['metric', 'imperial']),
    dist: strParam<ViewingDistance>('arms', ['arms', 'near', 'far']),
    depth: strParam<BitDepth>('raw14', ['jpeg8', 'raw14', 'tiff16']),
    print: strParam(state.printPresetId, allPrintIds),
    orient: strParam<'landscape' | 'portrait'>('landscape', ['landscape', 'portrait']),
    fit: strParam<'crop' | 'fit'>('crop', ['crop', 'fit']),
  }), [allPrintIds, allAspectIds, dpiValues, state.units, state.printPresetId])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hydrated = useQueryInit(schema as any, {
    show: setters.setVisible,
    mode: setters.setMode,
    aspect: setters.setAspectId,
    dpi: setters.setDpi,
    units: setters.setUnits,
    dist: setters.setViewingDistance,
    depth: setters.setBitDepth,
    print: setters.setPrintPresetId,
    orient: setters.setPrintOrientation,
    fit: setters.setPrintFitMode,
  })

  const stateForSync = {
    show: state.visible,
    mode: state.mode,
    aspect: state.aspectId,
    dpi: state.dpi,
    units: state.units,
    dist: state.viewingDistance,
    depth: state.bitDepth,
    print: state.printPresetId,
    orient: state.printOrientation,
    fit: state.printFitMode,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useToolQuerySync(stateForSync as any, schema as any)

  return hydrated
}
