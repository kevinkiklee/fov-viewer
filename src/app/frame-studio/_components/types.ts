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

/** Get thickness in pixels */
export function thicknessToPx(t: GridOptions['thickness']): number {
  return t === 'thin' ? 1 : t === 'medium' ? 2 : 3
}
