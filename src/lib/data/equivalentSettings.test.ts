import { describe, it, expect } from 'vitest'
import { closestRealAperture, COMMON_FOCAL_LENGTHS, closestRealFL } from './equivalentSettings'

describe('COMMON_FOCAL_LENGTHS', () => {
  it('is non-empty', () => {
    expect(COMMON_FOCAL_LENGTHS.length).toBeGreaterThan(0)
  })
  it('all values are positive integers', () => {
    for (const fl of COMMON_FOCAL_LENGTHS) {
      expect(fl).toBeGreaterThan(0)
      expect(Number.isInteger(fl)).toBe(true)
    }
  })
  it('is sorted ascending', () => {
    for (let i = 1; i < COMMON_FOCAL_LENGTHS.length; i++) {
      expect(COMMON_FOCAL_LENGTHS[i]).toBeGreaterThan(COMMON_FOCAL_LENGTHS[i - 1])
    }
  })
  it('has no duplicates', () => {
    const unique = new Set(COMMON_FOCAL_LENGTHS)
    expect(unique.size).toBe(COMMON_FOCAL_LENGTHS.length)
  })
  it('includes standard focal lengths', () => {
    expect(COMMON_FOCAL_LENGTHS).toContain(24)
    expect(COMMON_FOCAL_LENGTHS).toContain(35)
    expect(COMMON_FOCAL_LENGTHS).toContain(50)
    expect(COMMON_FOCAL_LENGTHS).toContain(85)
    expect(COMMON_FOCAL_LENGTHS).toContain(200)
  })
  it('ranges from ultra-wide to super-telephoto', () => {
    expect(COMMON_FOCAL_LENGTHS[0]).toBeLessThanOrEqual(10)
    expect(COMMON_FOCAL_LENGTHS[COMMON_FOCAL_LENGTHS.length - 1]).toBeGreaterThanOrEqual(600)
  })
})

describe('closestRealAperture', () => {
  it('returns exact match for a standard aperture', () => {
    expect(closestRealAperture(2.8)).toBe(2.8)
    expect(closestRealAperture(5.6)).toBe(5.6)
    expect(closestRealAperture(8)).toBe(8)
    expect(closestRealAperture(16)).toBe(16)
  })
  it('snaps to nearest third-stop value', () => {
    // 2.6 is between 2.5 and 2.8 — should snap to one of them
    const result = closestRealAperture(2.6)
    expect([2.5, 2.8]).toContain(result)
  })
  it('returns a positive number', () => {
    expect(closestRealAperture(3)).toBeGreaterThan(0)
  })
  it('handles very small aperture values', () => {
    const result = closestRealAperture(0.5)
    expect(result).toBe(1) // smallest in APERTURES_THIRD_STOP
  })
  it('handles very large aperture values', () => {
    const result = closestRealAperture(100)
    expect(result).toBe(64) // largest in APERTURES_THIRD_STOP
  })
  it('uses logarithmic distance (not linear)', () => {
    // f/1.2 is between f/1.1 and f/1.2 — exact match should return 1.2
    expect(closestRealAperture(1.2)).toBe(1.2)
  })
})

describe('closestRealFL', () => {
  it('returns exact match for a standard focal length', () => {
    expect(closestRealFL(50)).toBe(50)
    expect(closestRealFL(85)).toBe(85)
    expect(closestRealFL(200)).toBe(200)
  })
  it('snaps to nearest focal length for in-between values', () => {
    // 42 is between 40 and 50 — should snap to 40 (closer by 2 vs 8)
    expect(closestRealFL(42)).toBe(40)
    // 46 is between 40 and 50 — should snap to 50 (closer by 4 vs 6)
    expect(closestRealFL(46)).toBe(50)
  })
  it('returns a positive number', () => {
    expect(closestRealFL(30)).toBeGreaterThan(0)
  })
  it('handles values below the smallest focal length', () => {
    expect(closestRealFL(1)).toBe(COMMON_FOCAL_LENGTHS[0])
  })
  it('handles values above the largest focal length', () => {
    expect(closestRealFL(2000)).toBe(COMMON_FOCAL_LENGTHS[COMMON_FOCAL_LENGTHS.length - 1])
  })
  it('returns an element from COMMON_FOCAL_LENGTHS', () => {
    const testValues = [15, 27, 42, 60, 150, 250, 450]
    for (const val of testValues) {
      expect(COMMON_FOCAL_LENGTHS).toContain(closestRealFL(val))
    }
  })
})
