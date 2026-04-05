import { describe, it, expect } from 'vitest'
import { LATITUDE_PRESETS } from './starTrailCalculator'

describe('LATITUDE_PRESETS', () => {
  it('contains 3 presets', () => {
    expect(LATITUDE_PRESETS).toHaveLength(3)
  })

  it('all have non-empty key and valid latitude (0-90)', () => {
    for (const p of LATITUDE_PRESETS) {
      expect(p.key).toBeTruthy()
      expect(p.value).toBeGreaterThanOrEqual(0)
      expect(p.value).toBeLessThanOrEqual(90)
    }
  })

  it('keys are unique', () => {
    const keys = LATITUDE_PRESETS.map(p => p.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('includes equator (0°)', () => {
    expect(LATITUDE_PRESETS.find(p => p.value === 0)).toBeDefined()
  })
})
