import type { LensConfig } from '@/lib/types'

export type Orientation = 'landscape' | 'portrait'

export const LENS_COLORS = ['#3b82f6', '#f59e0b', '#10b981']
export const LENS_LABELS = ['A', 'B', 'C']
export const MAX_LENSES = 3

export interface FovViewerState {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  activeLens: number
}

export const DEFAULT_FOV_STATE: FovViewerState = {
  lenses: [
    { focalLength: 20, sensorId: 'ff' },
    { focalLength: 35, sensorId: 'ff' },
  ],
  imageIndex: 0,
  orientation: 'landscape',
  activeLens: 0,
}
