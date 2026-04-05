export type EditorMode = 'view' | 'crop' | 'frame'

export type GridType =
  | 'rule-of-thirds'
  | 'golden-ratio'
  | 'golden-spiral'
  | 'golden-diagonal'
  | 'diagonal-lines'
  | 'center-cross'
  | 'square-grid'
  | 'triangles'

export interface GridOptions {
  color: string
  opacity: number
  thickness: 'thin' | 'medium' | 'thick'
  spiralRotation: 0 | 90 | 180 | 270
  gridDensity: number
}

export type FrameFillType = 'solid' | 'gradient' | 'texture'

export type GradientDirection =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'diagonal-tl'
  | 'diagonal-tr'
  | 'radial'

export type TexturePreset = 'linen' | 'film-grain' | 'canvas' | 'paper' | 'wood' | 'marble'

export interface FrameConfig {
  preset: FramePresetId
  borderWidth: number
  fillType: FrameFillType
  solidColor: string
  gradientColor1: string
  gradientColor2: string
  gradientDirection: GradientDirection
  texture: TexturePreset
  innerMatEnabled: boolean
  innerMatWidth: number
  innerMatColor: string
  cornerRadius: number
  shadowEnabled: boolean
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
}

export type FramePresetId = 'none' | 'white' | 'black' | 'custom'

export interface CropState {
  x: number
  y: number
  width: number
  height: number
}

export type AspectRatioType = number | null | 'original'

export interface AspectRatioPreset {
  label: string
  value: AspectRatioType
  w: number
  h: number
}

export const ASPECT_RATIOS: AspectRatioPreset[] = [
  { label: 'Original', value: 'original', w: 0, h: 0 },
  { label: 'Free', value: null, w: 0, h: 0 },
  { label: '1:1', value: 1, w: 1, h: 1 },
  { label: '4:3', value: 4 / 3, w: 4, h: 3 },
  { label: '3:2', value: 3 / 2, w: 3, h: 2 },
  { label: '16:9', value: 16 / 9, w: 16, h: 9 },
  { label: '5:4', value: 5 / 4, w: 5, h: 4 },
  { label: '7:5', value: 7 / 5, w: 7, h: 5 },
]

export const DEFAULT_GRID_OPTIONS: GridOptions = {
  color: '#ffffff',
  opacity: 0.8,
  thickness: 'medium',
  spiralRotation: 0,
  gridDensity: 4,
}

export const DEFAULT_FRAME_CONFIG: FrameConfig = {
  preset: 'custom',
  borderWidth: 100,
  fillType: 'solid',
  solidColor: '#ffffff',
  gradientColor1: '#ffffff',
  gradientColor2: '#000000',
  gradientDirection: 'top',
  texture: 'linen',
  innerMatEnabled: false,
  innerMatWidth: 8,
  innerMatColor: '#cccccc',
  cornerRadius: 0,
  shadowEnabled: false,
  shadowColor: '#000000',
  shadowBlur: 20,
  shadowOffsetX: 0,
  shadowOffsetY: 4,
}

export const FRAME_PRESETS: Record<FramePresetId, Partial<FrameConfig>> = {
  none: { borderWidth: 0 },
  white: { borderWidth: 100, fillType: 'solid', solidColor: '#ffffff', cornerRadius: 0 },
  black: { borderWidth: 100, fillType: 'solid', solidColor: '#000000', cornerRadius: 0 },
  custom: {},
}

/** Get thickness in pixels */
export function thicknessToPx(t: GridOptions['thickness']): number {
  return t === 'thin' ? 1 : t === 'medium' ? 2 : 3
}
