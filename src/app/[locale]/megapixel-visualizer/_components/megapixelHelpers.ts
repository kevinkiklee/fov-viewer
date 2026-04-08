import type { DisplayMode } from './megapixelTypes'

/** Estimate content height before canvas buffer allocation. */
export function estimateContentHeight(mode: DisplayMode, visibleCount: number): number {
  if (visibleCount === 0) return 300
  switch (mode) {
    case 'overlay':      return Math.max(400, visibleCount * 50 + 200)
    case 'side-by-side': return Math.max(350, 400)
    case 'print-preset': return Math.max(400, 500)
    default:             return 400
  }
}

export function easeOut(t: number): number {
  return 1 - (1 - t) ** 3
}
