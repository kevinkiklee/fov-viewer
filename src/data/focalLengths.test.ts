import { describe, it, expect } from 'vitest'
import { FOCAL_LENGTHS, FOCAL_MIN, FOCAL_MAX } from './focalLengths'

describe('FOCAL_LENGTHS', () => {
  it('is sorted in ascending order', () => {
    for (let i = 1; i < FOCAL_LENGTHS.length; i++) {
      expect(FOCAL_LENGTHS[i].value).toBeGreaterThan(FOCAL_LENGTHS[i - 1].value)
    }
  })

  it('starts at FOCAL_MIN', () => {
    expect(FOCAL_LENGTHS[0].value).toBe(FOCAL_MIN)
  })

  it('ends at FOCAL_MAX', () => {
    expect(FOCAL_LENGTHS[FOCAL_LENGTHS.length - 1].value).toBe(FOCAL_MAX)
  })

  it('all values are positive integers', () => {
    for (const fl of FOCAL_LENGTHS) {
      expect(fl.value).toBeGreaterThan(0)
      expect(Number.isInteger(fl.value)).toBe(true)
    }
  })

  it('includes standard focal lengths', () => {
    const values = FOCAL_LENGTHS.map((fl) => fl.value)
    expect(values).toContain(24)
    expect(values).toContain(35)
    expect(values).toContain(50)
    expect(values).toContain(85)
    expect(values).toContain(200)
  })

  it('labels are either strings or null', () => {
    for (const fl of FOCAL_LENGTHS) {
      expect(fl.label === null || typeof fl.label === 'string').toBe(true)
    }
  })
})
