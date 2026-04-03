import type { FocalLengthPreset } from '@/lib/types'

export const FOCAL_LENGTHS: FocalLengthPreset[] = [
  { value: 8, label: 'Fisheye' },
  { value: 14, label: 'Ultra-wide' },
  { value: 20, label: null },
  { value: 24, label: 'Wide' },
  { value: 35, label: null },
  { value: 40, label: null },
  { value: 50, label: 'Normal' },
  { value: 85, label: 'Portrait' },
  { value: 135, label: null },
  { value: 200, label: 'Tele' },
  { value: 400, label: 'Super-tele' },
  { value: 600, label: null },
  { value: 800, label: null },
]

export const FOCAL_MIN = 8
export const FOCAL_MAX = 800
