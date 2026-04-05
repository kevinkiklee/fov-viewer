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
} from '@/app/frame-studio/_components/types'

// ---------------------------------------------------------------------------
// Aspect ratios (CropPanel)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Grid defaults & palette (GridControls)
// ---------------------------------------------------------------------------

export const DEFAULT_GRID_OPTIONS: GridOptions = {
  color: '#ffffff',
  opacity: 0.8,
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
