export const SHUTTER_PRESETS = [
  { value: 2, label: '2s' },
  { value: 1, label: '1s' },
  { value: 0.5, label: '1/2' },
  { value: 0.25, label: '1/4' },
  { value: 1 / 8, label: '1/8' },
  { value: 1 / 15, label: '1/15' },
  { value: 1 / 30, label: '1/30' },
  { value: 1 / 60, label: '1/60' },
  { value: 1 / 125, label: '1/125' },
  { value: 1 / 250, label: '1/250' },
  { value: 1 / 500, label: '1/500' },
  { value: 1 / 1000, label: '1/1000' },
  { value: 1 / 2000, label: '1/2000' },
  { value: 1 / 4000, label: '1/4000' },
]

export interface Subject {
  key: string
  speed: number
  color: string
}

export const SUBJECTS: Subject[] = [
  { key: 'standingPerson', speed: 0, color: '#10b981' },
  { key: 'slowWalk', speed: 4, color: '#3b82f6' },
  { key: 'jogging', speed: 10, color: '#8b5cf6' },
  { key: 'running', speed: 20, color: '#f59e0b' },
  { key: 'cyclist', speed: 35, color: '#ef4444' },
  { key: 'birdsInFlight', speed: 50, color: '#ec4899' },
  { key: 'carCity', speed: 60, color: '#a855f7' },
  { key: 'f1Car', speed: 330, color: '#f43f5e' },
  { key: 'airplaneLanding', speed: 370, color: '#06b6d4' },
]

export function getVerdict(speed: number, shutterSpeed: number): { key: string; color: string } {
  if (speed === 0) return { key: 'verdictFrozen', color: '#10b981' }
  const motionFt = speed * shutterSpeed
  if (motionFt < 0.02) return { key: 'verdictFrozen', color: '#10b981' }
  if (motionFt < 0.1) return { key: 'verdictMostlySharp', color: '#3b82f6' }
  if (motionFt < 0.5) return { key: 'verdictSlightBlur', color: '#f59e0b' }
  return { key: 'verdictMotionBlur', color: '#ef4444' }
}
