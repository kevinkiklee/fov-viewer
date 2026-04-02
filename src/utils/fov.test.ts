import { describe, it, expect } from 'vitest'
import { calcFOV, calcFrameWidth, calcEquivFocalLength, calcCropRatio } from './fov'

describe('calcFOV', () => {
  it('calculates FOV for 50mm full frame', () => {
    const fov = calcFOV(50, 1.0)
    expect(fov.horizontal).toBeCloseTo(39.6, 1)
    expect(fov.vertical).toBeCloseTo(27.0, 1)
  })

  it('calculates FOV for 35mm full frame', () => {
    const fov = calcFOV(35, 1.0)
    expect(fov.horizontal).toBeCloseTo(54.4, 1)
    expect(fov.vertical).toBeCloseTo(37.8, 1)
  })

  it('applies crop factor', () => {
    const apsc = calcFOV(50, 1.5)
    const ff75 = calcFOV(75, 1.0)
    expect(apsc.horizontal).toBeCloseTo(ff75.horizontal, 1)
    expect(apsc.vertical).toBeCloseTo(ff75.vertical, 1)
  })

  it('returns wider FOV for shorter focal lengths', () => {
    const wide = calcFOV(24, 1.0)
    const normal = calcFOV(50, 1.0)
    const tele = calcFOV(200, 1.0)
    expect(wide.horizontal).toBeGreaterThan(normal.horizontal)
    expect(normal.horizontal).toBeGreaterThan(tele.horizontal)
  })

  it('horizontal is always wider than vertical (3:2 sensor)', () => {
    for (const fl of [14, 35, 50, 85, 200]) {
      const fov = calcFOV(fl, 1.0)
      expect(fov.horizontal).toBeGreaterThan(fov.vertical)
    }
  })

  it('handles extreme wide-angle (8mm fisheye)', () => {
    const fov = calcFOV(8, 1.0)
    expect(fov.horizontal).toBeGreaterThan(100)
    expect(fov.horizontal).toBeLessThan(180)
  })

  it('handles extreme telephoto (800mm)', () => {
    const fov = calcFOV(800, 1.0)
    expect(fov.horizontal).toBeGreaterThan(0)
    expect(fov.horizontal).toBeLessThan(5)
  })

  it('larger crop factor narrows FOV', () => {
    const ff = calcFOV(50, 1.0)
    const apsc = calcFOV(50, 1.5)
    const m43 = calcFOV(50, 2.0)
    expect(ff.horizontal).toBeGreaterThan(apsc.horizontal)
    expect(apsc.horizontal).toBeGreaterThan(m43.horizontal)
  })

  it('medium format (crop < 1) widens FOV', () => {
    const mf = calcFOV(50, 0.79)
    const ff = calcFOV(50, 1.0)
    expect(mf.horizontal).toBeGreaterThan(ff.horizontal)
  })
})

describe('calcFrameWidth', () => {
  it('calculates frame width at distance', () => {
    const fov = calcFOV(50, 1.0)
    const width = calcFrameWidth(fov.horizontal, 10)
    expect(width).toBeCloseTo(7.3, 0)
  })

  it('doubles frame width at double distance', () => {
    const fov = calcFOV(50, 1.0)
    const w1 = calcFrameWidth(fov.horizontal, 5)
    const w2 = calcFrameWidth(fov.horizontal, 10)
    expect(w2).toBeCloseTo(w1 * 2, 5)
  })

  it('returns 0 at zero distance', () => {
    expect(calcFrameWidth(39.6, 0)).toBeCloseTo(0, 5)
  })

  it('wider FOV produces wider frame at same distance', () => {
    const wide = calcFOV(24, 1.0)
    const tele = calcFOV(200, 1.0)
    expect(calcFrameWidth(wide.horizontal, 10)).toBeGreaterThan(
      calcFrameWidth(tele.horizontal, 10)
    )
  })
})

describe('calcEquivFocalLength', () => {
  it('returns equivalent focal length', () => {
    expect(calcEquivFocalLength(50, 1.5)).toBe(75)
  })

  it('returns same value for full frame', () => {
    expect(calcEquivFocalLength(50, 1.0)).toBe(50)
  })

  it('rounds to nearest integer', () => {
    expect(calcEquivFocalLength(35, 1.5)).toBe(53)
    expect(calcEquivFocalLength(35, 1.6)).toBe(56)
  })

  it('handles sub-1 crop factor (medium format)', () => {
    expect(calcEquivFocalLength(50, 0.79)).toBe(40)
  })

  it('handles all standard sensor crop factors', () => {
    const cropFactors = [0.79, 1.0, 1.5, 1.6, 2.0, 2.7, 6.0]
    for (const cf of cropFactors) {
      const result = calcEquivFocalLength(50, cf)
      expect(result).toBeGreaterThan(0)
      expect(Number.isInteger(result)).toBe(true)
    }
  })
})

describe('calcCropRatio', () => {
  it('returns 1 when both lenses have same FOV', () => {
    const fovA = calcFOV(50, 1.0)
    const fovB = calcFOV(50, 1.0)
    expect(calcCropRatio(fovA.horizontal, fovB.horizontal)).toBeCloseTo(1, 2)
  })

  it('returns ratio < 1 for narrower FOV', () => {
    const wide = calcFOV(35, 1.0)
    const tele = calcFOV(85, 1.0)
    const ratio = calcCropRatio(tele.horizontal, wide.horizontal)
    expect(ratio).toBeLessThan(1)
    expect(ratio).toBeGreaterThan(0)
  })

  it('returns ratio > 1 when narrow is actually wider', () => {
    const wide = calcFOV(24, 1.0)
    const tele = calcFOV(85, 1.0)
    const ratio = calcCropRatio(wide.horizontal, tele.horizontal)
    expect(ratio).toBeGreaterThan(1)
  })

  it('is inverse-symmetric', () => {
    const fovA = calcFOV(35, 1.0)
    const fovB = calcFOV(85, 1.0)
    const ab = calcCropRatio(fovA.horizontal, fovB.horizontal)
    const ba = calcCropRatio(fovB.horizontal, fovA.horizontal)
    expect(ab * ba).toBeCloseTo(1, 5)
  })

  it('crop ratio matches expected frame proportion', () => {
    // 50mm on APS-C should show same crop as 75mm on FF relative to 50mm FF
    const ff50 = calcFOV(50, 1.0)
    const ff75 = calcFOV(75, 1.0)
    const ratio = calcCropRatio(ff75.horizontal, ff50.horizontal)
    expect(ratio).toBeCloseTo(0.5, 0) // roughly half the frame
  })
})
