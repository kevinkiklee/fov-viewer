import type { LensConfig } from '@/lib/types'
import type { FovSimulatorState } from '@/app/fov-simulator/_components/types'

export const LENS_COLORS = ['#3b82f6', '#f59e0b', '#10b981']
export const LENS_LABELS = ['A', 'B', 'C']
export const MAX_LENSES = 3

export const DEFAULT_FOV_STATE: FovSimulatorState = {
  lenses: [
    { focalLength: 20, sensorId: 'ff' },
    { focalLength: 35, sensorId: 'ff' },
  ],
  imageIndex: 0,
  orientation: 'landscape',
  activeLens: 0,
  distance: 10,
  showGuides: false,
}

export const DISTANCE_PRESETS = [5, 10, 25, 50]

export const NEW_LENS_DEFAULTS: LensConfig[] = [
  { focalLength: 85, sensorId: 'ff' },
  { focalLength: 200, sensorId: 'ff' },
]
