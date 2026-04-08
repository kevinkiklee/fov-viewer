'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocale } from 'next-intl'
import {
  MP_PRESETS, DEFAULT_VISIBLE_MP_IDS, DEFAULT_DPI,
  DEFAULT_PRINT_METRIC_ID, DEFAULT_PRINT_IMPERIAL_ID,
  ALL_MP_ID_SET,
} from '@/lib/data/megapixelVisualizer'
import { DEFAULT_ASPECT_ID } from '@/lib/data/aspectRatios'
import { defaultUnitSystemForLocale } from '@/lib/utils/units'
import type { Locale } from '@/lib/i18n/routing'
import type { MegapixelPreset } from '@/lib/types'
import type { DisplayMode } from './megapixelTypes'
import type { ViewingDistance, BitDepth } from '@/lib/math/megapixel'
import { useMegapixelCustomStorage } from './useMegapixelCustomStorage'

export function useMegapixelState() {
  const locale = useLocale() as Locale

  const [visible, setVisible] = useState<Set<string>>(() => new Set(DEFAULT_VISIBLE_MP_IDS))
  const [mode, setMode] = useState<DisplayMode>('overlay')
  const [aspectId, setAspectId] = useState<string>(DEFAULT_ASPECT_ID)
  const [dpi, setDpi] = useState<number>(DEFAULT_DPI)
  const [units, setUnits] = useState<'metric' | 'imperial'>(() => defaultUnitSystemForLocale(locale))
  const [viewingDistance, setViewingDistance] = useState<ViewingDistance>('arms')
  const [bitDepth, setBitDepth] = useState<BitDepth>('raw14')
  const [printPresetId, setPrintPresetId] = useState<string>(
    () => defaultUnitSystemForLocale(locale) === 'imperial'
      ? DEFAULT_PRINT_IMPERIAL_ID
      : DEFAULT_PRINT_METRIC_ID,
  )
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape')
  const [printFitMode, setPrintFitMode] = useState<'crop' | 'fit'>('crop')
  const [cropTargetId, setCropTargetId] = useState<string | null>(null)
  const [hoveredMpId, setHoveredMpId] = useState<string | null>(null)

  const { customMps, addCustomMp, editCustomMp, removeCustomMp, removeAllCustomMps } = useMegapixelCustomStorage()

  const allMps = useMemo<MegapixelPreset[]>(
    () => [...MP_PRESETS, ...customMps.map(c => ({
      id: c.id, mp: c.mp, name: c.name, tag: 'ff' as const, color: c.color,
    }))],
    [customMps],
  )
  const visibleMps = useMemo(
    () => allMps.filter(m => visible.has(m.id)),
    [allMps, visible],
  )
  const allMpIdSet = useMemo(
    () => new Set([...ALL_MP_ID_SET, ...customMps.map(c => c.id)]),
    [customMps],
  )

  useEffect(() => {
    setHoveredMpId(null)
  }, [mode])

  const toggleMp = useCallback((id: string) => {
    setVisible(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  return {
    visible, mode, aspectId, dpi, units, viewingDistance, bitDepth,
    printPresetId, printOrientation, printFitMode, cropTargetId,
    hoveredMpId, customMps,
    allMps, visibleMps, allMpIdSet,
    setVisible, setMode, setAspectId, setDpi, setUnits, setViewingDistance,
    setBitDepth, setPrintPresetId, setPrintOrientation, setPrintFitMode,
    setCropTargetId, setHoveredMpId,
    toggleMp, addCustomMp, editCustomMp, removeCustomMp, removeAllCustomMps,
  }
}
