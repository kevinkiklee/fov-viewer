export interface SensorPreset {
  id: string
  name: string
  cropFactor: number
}

export interface FocalLengthPreset {
  value: number
  label: string | null
}

export interface LensConfig {
  focalLength: number
  sensorId: string
}

export type ViewMode = 'overlay' | 'side'
export type Orientation = 'landscape' | 'portrait'

export const LENS_COLORS = ['#3b82f6', '#f59e0b', '#10b981']
export const LENS_LABELS = ['A', 'B', 'C']
export const MAX_LENSES = 3

export interface AppState {
  lenses: LensConfig[]
  imageIndex: number
  mode: ViewMode
  orientation: Orientation
  distance: number
  theme: 'dark' | 'light'
  activeLens: number
}

export const DEFAULT_STATE: AppState = {
  lenses: [
    { focalLength: 20, sensorId: 'ff' },
    { focalLength: 35, sensorId: 'ff' },
  ],
  imageIndex: 0,
  mode: 'overlay',
  orientation: window.innerWidth < 1024 ? 'portrait' : 'landscape',
  distance: 10,
  theme: 'dark',
  activeLens: 0,
}
