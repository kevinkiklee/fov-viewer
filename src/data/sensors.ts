import type { SensorPreset } from '../types'

export const SENSORS: SensorPreset[] = [
  { id: 'mf', name: 'Medium Format', cropFactor: 0.79 },
  { id: 'ff', name: 'Full Frame', cropFactor: 1.0 },
  { id: 'apsc_n', name: 'APS-C (Nikon/Sony)', cropFactor: 1.5 },
  { id: 'apsc_c', name: 'APS-C (Canon)', cropFactor: 1.6 },
  { id: 'm43', name: 'Micro Four Thirds', cropFactor: 2.0 },
  { id: '1in', name: '1" Sensor', cropFactor: 2.7 },
]

export function getSensor(id: string): SensorPreset {
  return SENSORS.find((s) => s.id === id) ?? SENSORS[1]
}
