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

export type ToolStatus = 'live' | 'draft'
export type ToolCategory = 'calculator' | 'visualizer' | 'reference' | 'file-tool'

export interface ToolDef {
  slug: string
  name: string
  description: string
  status: ToolStatus
  category: ToolCategory
}
