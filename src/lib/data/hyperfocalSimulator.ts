export type HyperfocalScene = 'landscape' | 'street'

export const HYPERFOCAL_SCENE_PRESETS: { key: HyperfocalScene; tKey: string }[] = [
  { key: 'landscape', tKey: 'sceneLandscape' },
  { key: 'street', tKey: 'sceneStreet' },
]
