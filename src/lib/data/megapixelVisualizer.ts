import type { MegapixelPreset, PrintSizePreset } from '@/lib/types'
import { COMMON_MP, SENSORS, calcCropFactor, type MpEntry } from './sensors'

const CURATED_MP_ORDER: number[] = [
  8, 12, 16, 20, 24, 26, 33, 36, 42, 45, 50, 61, 100, 150, 200,
]

const MP_COLOR_BY_INDEX = [
  '#64748b', '#475569', '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899',
]

function tagForMp(mp: number): MegapixelPreset['tag'] {
  if (mp === 48 || mp === 50 || mp === 108 || mp === 200) return 'phone'
  if (mp >= 150) return 'extreme'
  if (mp >= 50) return 'mf'
  return 'ff'
}

function collectModels(): Map<number, string[]> {
  const map = new Map<number, string[]>()
  for (const entries of Object.values(COMMON_MP)) {
    for (const { mp, models } of entries as MpEntry[]) {
      const list = map.get(mp) ?? []
      if (models && !list.includes(models)) list.push(models)
      map.set(mp, list)
    }
  }
  return map
}

/**
 * MP presets derived from COMMON_MP at module load.
 * Custom sensors added at runtime in the sensor tool do NOT leak into this list —
 * the snapshot is taken once at import time.
 */
export const MP_PRESETS: MegapixelPreset[] = (() => {
  const modelMap = collectModels()
  return CURATED_MP_ORDER.map((mp, idx) => ({
    id: `mp_${mp}`,
    mp,
    name: `${mp} MP`,
    models: (modelMap.get(mp) ?? []).join(' · ') || undefined,
    tag: tagForMp(mp),
    color: MP_COLOR_BY_INDEX[idx % MP_COLOR_BY_INDEX.length],
  }))
})()

export const ALL_MP_IDS = MP_PRESETS.map(m => m.id)
export const ALL_MP_ID_SET = new Set(ALL_MP_IDS)
export const DEFAULT_VISIBLE_MP_IDS = ['mp_12', 'mp_24', 'mp_45', 'mp_100']

/** Advertised MP → typical output after pixel binning. */
export const PHONE_BINNING: Record<number, number> = {
  48: 12, 50: 12, 108: 12, 200: 12,
}

export const DPI_PRESETS = [
  { value: 72,  id: 'web' },
  { value: 150, id: 'magazine' },
  { value: 240, id: 'good-print' },
  { value: 300, id: 'fine-art' },
  { value: 360, id: 'epson' },
  { value: 600, id: 'archival' },
] as const

export const DEFAULT_DPI = 300

export const PRINT_SIZES_METRIC: PrintSizePreset[] = [
  { id: 'a0', label: 'A0', wMm: 841,  hMm: 1189, system: 'metric' },
  { id: 'a1', label: 'A1', wMm: 594,  hMm: 841,  system: 'metric' },
  { id: 'a2', label: 'A2', wMm: 420,  hMm: 594,  system: 'metric' },
  { id: 'a3', label: 'A3', wMm: 297,  hMm: 420,  system: 'metric' },
  { id: 'a4', label: 'A4', wMm: 210,  hMm: 297,  system: 'metric' },
  { id: 'a5', label: 'A5', wMm: 148,  hMm: 210,  system: 'metric' },
  { id: 'a6', label: 'A6', wMm: 105,  hMm: 148,  system: 'metric' },
]

export const PRINT_SIZES_IMPERIAL: PrintSizePreset[] = [
  { id: '4x6',   label: '4×6',   wMm: 101.6,  hMm: 152.4,  system: 'imperial' },
  { id: '5x7',   label: '5×7',   wMm: 127.0,  hMm: 177.8,  system: 'imperial' },
  { id: '8x10',  label: '8×10',  wMm: 203.2,  hMm: 254.0,  system: 'imperial' },
  { id: '11x14', label: '11×14', wMm: 279.4,  hMm: 355.6,  system: 'imperial' },
  { id: '16x20', label: '16×20', wMm: 406.4,  hMm: 508.0,  system: 'imperial' },
  { id: '20x30', label: '20×30', wMm: 508.0,  hMm: 762.0,  system: 'imperial' },
  { id: '24x36', label: '24×36', wMm: 609.6,  hMm: 914.4,  system: 'imperial' },
  { id: '40x60', label: '40×60', wMm: 1016.0, hMm: 1524.0, system: 'imperial' },
]

export const DEFAULT_PRINT_METRIC_ID = 'a4'
export const DEFAULT_PRINT_IMPERIAL_ID = '8x10'

/** Crop targets derived from SENSORS (excluding FF which is the reference). */
export const CROP_TARGETS = SENSORS
  .filter(s => s.id !== 'ff')
  .map(s => ({
    id: s.id,
    label: s.name,
    cropFactor: s.cropFactor ?? calcCropFactor(s.w!, s.h!),
  }))

export const BIT_DEPTHS = [
  { id: 'jpeg8',  bytesPerPixel: 0.3 },
  { id: 'raw14',  bytesPerPixel: 1.75 },
  { id: 'tiff16', bytesPerPixel: 6 },
] as const
