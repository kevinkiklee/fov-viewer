import type {
  AspectRatioPreset,
  EditorMode,
  FrameConfig,
  FrameFillType,
  FramePresetId,
  GradientDirection,
  GridOptions,
  GridType,
  TexturePreset,
} from '@/app/[locale]/frame-studio/_components/types'
import { ASPECT_RATIOS as SHARED_ASPECTS } from './aspectRatios'

// ---------------------------------------------------------------------------
// Aspect ratios (CropPanel)
// ---------------------------------------------------------------------------

export const ASPECT_RATIOS: AspectRatioPreset[] = [
  { label: 'Original', value: 'original', w: 0, h: 0 },
  { label: 'Free',     value: null,       w: 0, h: 0 },
  ...SHARED_ASPECTS.map(a => ({
    label: a.label,
    value: a.w / a.h,
    w: a.w,
    h: a.h,
  })),
]

// ---------------------------------------------------------------------------
// Grid defaults & palette (GridControls)
// ---------------------------------------------------------------------------

export const DEFAULT_GRID_OPTIONS: GridOptions = {
  color: '#ffffff',
  opacity: 0.7,
  thickness: 'medium',
  spiralRotation: 0,
  gridDensity: 4,
}

export const GRID_TYPES: { id: GridType; key: string }[] = [
  { id: 'rule-of-thirds', key: 'gridRuleOfThirds' },
  { id: 'golden-ratio', key: 'gridGoldenRatio' },
  { id: 'golden-spiral', key: 'gridGoldenSpiral' },
  { id: 'golden-diagonal', key: 'gridGoldenDiagonal' },
  { id: 'diagonal-lines', key: 'gridDiagonal' },
  { id: 'center-cross', key: 'gridCenterCross' },
  { id: 'square-grid', key: 'gridSquareGrid' },
  { id: 'triangles', key: 'gridTriangles' },
]

export const PALETTE_COLORS = [
  '#ffffff', // White
  '#00ffff', // Cyan (Default)
  '#00ff00', // Green
  '#ff00ff', // Magenta
  '#ffff00', // Yellow
  '#ff0000', // Red
  '#000000', // Black
]

// ---------------------------------------------------------------------------
// Frame presets & defaults (FramePanel)
// ---------------------------------------------------------------------------

export const DEFAULT_FRAME_CONFIG: FrameConfig = {
  preset: 'none',
  borderWidth: 0,
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

export const PRESET_LIST: { id: FramePresetId; key: string }[] = [
  { id: 'none', key: 'presetNone' },
  { id: 'white', key: 'presetWhite' },
  { id: 'black', key: 'presetBlack' },
  { id: 'custom', key: 'presetCustom' },
]

export const FILL_TYPES: { id: FrameFillType; key: string }[] = [
  { id: 'solid', key: 'fillSolid' },
  { id: 'gradient', key: 'fillGradient' },
  { id: 'texture', key: 'fillTexture' },
]

export const GRADIENT_DIRS: { id: GradientDirection; key: string }[] = [
  { id: 'top', key: 'dirUp' },
  { id: 'bottom', key: 'dirDown' },
  { id: 'left', key: 'dirLeft' },
  { id: 'right', key: 'dirRight' },
  { id: 'diagonal-tl', key: 'dirDiagTL' },
  { id: 'diagonal-tr', key: 'dirDiagTR' },
  { id: 'radial', key: 'dirRadial' },
]

export const TEXTURES: { id: TexturePreset; key: string }[] = [
  { id: 'linen', key: 'textureLinen' },
  { id: 'film-grain', key: 'textureFilmGrain' },
  { id: 'canvas', key: 'textureCanvas' },
  { id: 'paper', key: 'texturePaper' },
  { id: 'wood', key: 'textureWood' },
  { id: 'marble', key: 'textureMarble' },
]

// ---------------------------------------------------------------------------
// Editor mode keys (FrameSidebar)
// ---------------------------------------------------------------------------

export const MODE_KEYS: { value: EditorMode; key: string }[] = [
  { value: 'view', key: 'modeView' },
  { value: 'crop', key: 'modeCrop' },
  { value: 'frame', key: 'modeFrame' },
]
