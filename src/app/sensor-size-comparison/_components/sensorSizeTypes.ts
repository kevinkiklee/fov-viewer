import type { SensorPreset } from '@/lib/types'

export type DisplayMode = 'overlay' | 'side-by-side' | 'pixel-density'

export type SensorRect = { id: string; x: number; y: number; w: number; h: number; sensorW: number; sensorH: number; color: string }

export type StoredCustomSensor = { id: string; name: string; w: number; h: number; cropFactor: number; color: string; mp?: number }

export const CUSTOM_COLORS = ['#06b6d4', '#f97316', '#84cc16', '#e879f9', '#facc15', '#fb7185']

export const ANIM_DURATION = 300

export const DEFAULT_VISIBLE_IDS = ['mf', 'ff', 'apsc_n', 'm43', 'phone']
export const DEFAULT_VISIBLE = DEFAULT_VISIBLE_IDS.join('+')

export const STORAGE_KEY = 'phototools:custom-sensors'

export type ControlsPanelProps = {
  visible: Set<string>
  mode: DisplayMode
  customSensors: Required<SensorPreset>[]
  onToggleSensor: (id: string) => void
  onModeChange: (m: DisplayMode) => void
  onAddCustom: (name: string, w: number, h: number, mp: number) => void
  onRemoveCustom: (id: string) => void
  onRemoveAllCustom: () => void
  onEditCustom: (id: string, name: string, w: number, h: number, mp: number) => void
}
