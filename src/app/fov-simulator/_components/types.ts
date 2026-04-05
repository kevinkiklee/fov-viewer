import type { LensConfig } from '@/lib/types'

export type Orientation = 'landscape' | 'portrait'

export interface FovSimulatorState {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  activeLens: number
  distance: number
  showGuides: boolean
}
