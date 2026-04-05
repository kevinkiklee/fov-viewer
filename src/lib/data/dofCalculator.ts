import type { SceneKey } from '@/components/shared/DoFCanvas'

export const DOF_SCENE_PRESETS: { key: SceneKey; labelKey: string }[] = [
  { key: 'portrait', labelKey: 'scenePortrait' },
  { key: 'landscape', labelKey: 'sceneLandscape' },
  { key: 'street', labelKey: 'sceneStreet' },
  { key: 'macro', labelKey: 'sceneMacro' },
]
