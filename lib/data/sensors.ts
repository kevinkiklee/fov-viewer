import type { SensorPreset } from '@/lib/types'

export const SENSORS: SensorPreset[] = [
  { id: 'mf_645', name: 'Medium Format (54x40)', cropFactor: 0.64, w: 53.4, h: 40.0, color: '#a855f7' },
  { id: 'mf', name: 'Medium Format (44x33)', cropFactor: 0.79, w: 43.8, h: 32.9, color: '#8b5cf6' },
  { id: 'mf_leica', name: 'Medium Format (45x30)', cropFactor: 0.8, w: 45.0, h: 30.0, color: '#d946ef' },
  { id: 'ff', name: 'Full Frame', cropFactor: 1.0, w: 36, h: 24, color: '#3b82f6' },
  { id: 'apsc_n', name: 'APS-C (1.5x)', cropFactor: 1.5, w: 23.5, h: 15.6, color: '#10b981' },
  { id: 'apsc_c', name: 'APS-C (Canon)', cropFactor: 1.6, w: 22.3, h: 14.9, color: '#f59e0b' },
  { id: 'm43', name: 'Micro Four Thirds', cropFactor: 2.0, w: 17.3, h: 13, color: '#ef4444' },
  { id: '1in', name: '1" Sensor', cropFactor: 2.7, w: 13.2, h: 8.8, color: '#ec4899' },
  { id: 'phone', name: 'Smartphone Flagship (1/1.3")', cropFactor: 3.5, w: 9.8, h: 7.3, color: '#6366f1' },
]

export function getSensor(id: string): SensorPreset {
  return SENSORS.find((s) => s.id === id) ?? SENSORS[3] // Adjusted default to 'ff' at index 3
}

export const POPULAR_MODELS: Record<string, string[]> = {
  mf_645: ['Phase One IQ4 150MP'],
  mf: ['Hasselblad X2D', 'Fujifilm GFX 100S II'],
  mf_leica: ['Leica S3'],
  ff: ['Sony A7 IV', 'Nikon Z8', 'Canon R5', 'Leica Q3'],
  apsc_n: ['Sony A6700', 'Fujifilm X-T5', 'Nikon Z50II', 'Leica CL'],
  apsc_c: ['Canon R7', 'Canon R10'],
  m43: ['OM System OM-1', 'Panasonic GH6'],
  '1in': ['Sony RX100 VII'],
  phone: ['iPhone 16 Pro', 'Samsung S24 Ultra'],
}

export type MpEntry = { mp: number; models: string }

export const COMMON_MP: Record<string, MpEntry[]> = {
  mf_645: [
    { mp: 150, models: 'Phase One IQ4' },
  ],
  mf: [
    { mp: 50, models: 'Fujifilm GFX 50S II / Pentax 645Z' },
    { mp: 100, models: 'Hasselblad X2D / GFX 100S II' },
  ],
  mf_leica: [
    { mp: 64, models: 'Leica S3' },
  ],
  ff: [
    { mp: 12, models: 'Sony A7S III' },
    { mp: 20, models: 'Canon R6' },
    { mp: 24, models: 'Sony A7 III / Nikon Z6 III / Canon R6 Mark II / Leica SL2-S / Leica M10' },
    { mp: 33, models: 'Sony A7 IV' },
    { mp: 45, models: 'Canon R5 / Nikon Z8 / Nikon Z9' },
    { mp: 47, models: 'Leica Q2 / Leica SL2' },
    { mp: 60, models: 'Leica M11 / Leica Q3 / Leica SL3' },
    { mp: 61, models: 'Sony A7R V / Sigma fp L' },
  ],
  apsc_n: [
    { mp: 20, models: 'Nikon Z50 / Z50II' },
    { mp: 24, models: 'Sony A6400 / Leica CL' },
    { mp: 26, models: 'Sony A6700 / Fujifilm X-H2S' },
    { mp: 40, models: 'Fujifilm X-T5 / X-H2' },
  ],
  apsc_c: [
    { mp: 24, models: 'Canon R10 / Canon R50' },
    { mp: 32, models: 'Canon R7' },
  ],
  m43: [
    { mp: 16, models: 'Lumix GX85' },
    { mp: 20, models: 'OM System OM-1 / Lumix G9' },
    { mp: 25, models: 'Lumix GH6 / Lumix G9 II' },
  ],
  '1in': [{ mp: 20, models: 'Sony RX100 V/VI/VII' }],
  phone: [
    { mp: 12, models: 'iPhone 14' },
    { mp: 48, models: 'iPhone 15 / iPhone 16 Pro' },
    { mp: 108, models: 'Samsung S22 Ultra' },
    { mp: 200, models: 'Samsung S23 Ultra / S24 Ultra' },
  ],
}