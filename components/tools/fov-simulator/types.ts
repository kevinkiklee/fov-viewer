import type { LensConfig } from '@/lib/types'

export type Orientation = 'landscape' | 'portrait'
export type ViewMode = 'fov' | 'compression'

export const LENS_COLORS = ['#3b82f6', '#f59e0b', '#10b981']
export const LENS_LABELS = ['A', 'B', 'C']
export const MAX_LENSES = 3

export interface FovSimulatorState {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  activeLens: number
  distance: number
  viewMode: ViewMode
  showGuides: boolean
}

export const DEFAULT_FOV_STATE: FovSimulatorState = {
  lenses: [
    { focalLength: 20, sensorId: 'ff' },
    { focalLength: 35, sensorId: 'ff' },
  ],
  imageIndex: 0,
  orientation: 'landscape',
  activeLens: 0,
  distance: 10,
  viewMode: 'fov',
  showGuides: false,
}
