import { APERTURES, SHUTTER_SPEEDS, ISOS } from '@/lib/data/camera'

export type LockTarget = 'aperture' | 'shutter' | 'iso'

export function formatShutter(s: number): string {
  if (s >= 1) return `${s}s`
  return `1/${Math.round(1 / s)}`
}

export function findNearest(arr: number[], target: number): number {
  let best = arr[0]
  let bestDist = Math.abs(Math.log2(target) - Math.log2(best))
  for (const v of arr) {
    const dist = Math.abs(Math.log2(target) - Math.log2(v))
    if (dist < bestDist) {
      bestDist = dist
      best = v
    }
  }
  return best
}

export function dofLabelKey(aperture: number): string {
  if (aperture <= 2) return 'dofVeryShallow'
  if (aperture <= 4) return 'dofShallow'
  if (aperture <= 8) return 'dofModerate'
  if (aperture <= 16) return 'dofDeep'
  return 'dofVeryDeep'
}

export function motionLabelKey(shutter: number): string {
  if (shutter <= 1/1000) return 'motionFrozen'
  if (shutter <= 1/250) return 'motionSharp'
  if (shutter <= 1/60) return 'motionModerate'
  if (shutter <= 1/8) return 'motionSlightBlur'
  return 'motionBlurred'
}

export function noiseLabelKey(iso: number): string {
  if (iso <= 200) return 'noiseClean'
  if (iso <= 800) return 'noiseLow'
  if (iso <= 3200) return 'noiseModerate'
  if (iso <= 12800) return 'noiseNoisy'
  return 'noiseVeryNoisy'
}

export function effectBar(level: number): string {
  return `${Math.round(level * 100)}%`
}

export function dofLevel(aperture: number): number {
  const idx = APERTURES.indexOf(aperture)
  return idx >= 0 ? idx / (APERTURES.length - 1) : 0.5
}

export function motionLevel(shutter: number): number {
  const idx = SHUTTER_SPEEDS.indexOf(shutter)
  return idx >= 0 ? idx / (SHUTTER_SPEEDS.length - 1) : 0.5
}

export function noiseLevel(iso: number): number {
  const idx = ISOS.indexOf(iso)
  return idx >= 0 ? idx / (ISOS.length - 1) : 0.5
}
