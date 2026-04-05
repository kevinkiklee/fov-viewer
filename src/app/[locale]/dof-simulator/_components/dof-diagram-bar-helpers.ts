/* ── DofDiagramBar layout and mapping helpers ── */

/** SVG viewBox dimensions */
export const W = 700
export const H = 80
export const PAD_L = 40
export const PAD_R = 20
export const STRIP_Y = 8
export const STRIP_H = 32
export const AXIS_Y = STRIP_Y + STRIP_H + 22

/** Logarithmic distance mapping range */
const MIN_LOG = Math.log(0.1)
const MAX_LOG = Math.log(30)

/** Convert a distance in meters to an SVG X coordinate (logarithmic). */
export function distToX(meters: number): number {
  if (!isFinite(meters)) return W - PAD_R
  const clamped = Math.max(0.1, Math.min(30, meters))
  return PAD_L + ((Math.log(clamped) - MIN_LOG) / (MAX_LOG - MIN_LOG)) * (W - PAD_L - PAD_R)
}

/** Convert an SVG X coordinate back to a distance in meters (logarithmic). */
export function xToDist(x: number): number {
  const usable = W - PAD_L - PAD_R
  const t = Math.max(0, Math.min(1, (x - PAD_L) / usable))
  return Math.exp(MIN_LOG + t * (MAX_LOG - MIN_LOG))
}

/** Axis tick marks with labels. */
export const AXIS_TICKS = [
  { m: 0.1, label: '0' },
  { m: 1, label: '1m' },
  { m: 3, label: '3m' },
  { m: 5, label: '5m' },
  { m: 10, label: '10m' },
  { m: 15, label: '15m' },
  { m: 25, label: '25m' },
]
