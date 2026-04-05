export const PILLAR_COUNT = 6
export const PILLAR_SPACING = 15
export const PILLAR_RADIUS = 0.4
export const PILLAR_HEIGHT = 6.0
export const PILLAR_SEGMENTS = 16
export const PILLAR_X = 2.5

export const ACCENT_COLOR = '#3b82f6'

export const PILLAR_COLORS: [number, number, number][] = [
  [0.93, 0.26, 0.26],
  [0.95, 0.61, 0.15],
  [0.95, 0.85, 0.20],
  [0.25, 0.78, 0.35],
  [0.30, 0.50, 0.90],
  [0.60, 0.40, 0.80],
]

export const GROUND_COLOR: [number, number, number] = [0.12, 0.12, 0.18]
export const GRID_COLOR: [number, number, number] = [0.25, 0.25, 0.35]

export interface CompressionSceneProps {
  focalLength: number
  sensorId: string
  distance: number
}
