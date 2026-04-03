import { describe, it, expect } from 'vitest'
import { calcCameraDistance } from './compression'

describe('calcCameraDistance', () => {
  it('returns subject distance for the reference focal length', () => {
    // 50mm ref, 50mm lens, 10ft → 10ft
    expect(calcCameraDistance(50, 50, 10)).toBeCloseTo(10, 5)
  })

  it('moves camera farther for longer focal lengths', () => {
    // 200mm lens vs 50mm ref at 10ft → must stand farther
    const distance = calcCameraDistance(200, 50, 10)
    expect(distance).toBeGreaterThan(10)
  })

  it('moves camera closer for shorter focal lengths', () => {
    // 24mm lens vs 50mm ref at 10ft → must stand closer
    const distance = calcCameraDistance(24, 50, 10)
    expect(distance).toBeLessThan(10)
  })

  it('keeps subject same apparent size (focalLength/distance ratio is constant)', () => {
    const refFocalLength = 50
    const subjectDistance = 10

    const fl1 = 85
    const fl2 = 200
    const fl3 = 24

    const d1 = calcCameraDistance(fl1, refFocalLength, subjectDistance)
    const d2 = calcCameraDistance(fl2, refFocalLength, subjectDistance)
    const d3 = calcCameraDistance(fl3, refFocalLength, subjectDistance)

    // The ratio focalLength/distance should be the same for all
    const refRatio = refFocalLength / subjectDistance
    expect(fl1 / d1).toBeCloseTo(refRatio, 5)
    expect(fl2 / d2).toBeCloseTo(refRatio, 5)
    expect(fl3 / d3).toBeCloseTo(refRatio, 5)
  })
})
